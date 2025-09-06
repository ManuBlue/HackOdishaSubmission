import os
from fastapi import FastAPI, HTTPException, Form, UploadFile, File,BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
from bson import ObjectId
from typing import  List
from fastapi.responses import FileResponse
import jwt

app = FastAPI()

from processVideo import processVideo
from modelHandling import createModelScratch
# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
secretToken = "Letthisbetemp"
# MongoDB client
client = AsyncIOMotorClient("mongodb+srv://admin:admin123@mycluster.h0cxfmp.mongodb.net/")
db = client['Monitr']
collection = db['User_credentials']

# Paths
currDirectory = os.path.dirname(os.path.abspath(__file__))
usersFolder = os.path.join(currDirectory, "../", "database", "users")

# -------------------------------
# Helper functions
# -------------------------------
async def get_user(email: str):
    user_data = await collection.find_one({"email": email})
    if user_data:
        # Convert MongoDB ObjectId to string
        user_data["id"] = str(user_data["_id"])
        return user_data
    return None
async def getUserById(userId: str):
    user_data = await collection.find_one({"_id": ObjectId(userId)})
    if user_data:
        # Convert MongoDB ObjectId to string
        user_data["id"] = str(user_data["_id"])
        return user_data
    return None

def hash_password(password: str) -> str:
    """Hash password and return as utf-8 string."""
    bytes_pw = password.encode("utf-8")
    hashed_pw = bcrypt.hashpw(bytes_pw, bcrypt.gensalt(rounds=12))
    return hashed_pw.decode("utf-8")
def cleanup_files(paths: list[str]):
    for path in paths:
        try:
            os.remove(path)
        except Exception as e:
            print(f"Failed to remove {path}: {e}")
def tokenToUserId(token: str) -> str:
    try:
        decoded = jwt.decode(token, secretToken, algorithms=["HS256"])
        return decoded.get("user_id")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
# -------------------------------
# Endpoints
# -------------------------------

@app.post("/register")
async def register(username: str = Form(...), email: str = Form(...), password: str = Form(...)):
    existing_user = await get_user(email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists!")

    try:
        hashed_password = hash_password(password)

        # Create user document
        user_document = {
            "username": username,
            "email": email,
            "password": hashed_password
        }

        # Insert into MongoDB
        result = await collection.insert_one(user_document)        
        # Ensure user folders exist
        os.makedirs(os.path.join(usersFolder, str(result.inserted_id)), exist_ok=True)
        os.makedirs(os.path.join(usersFolder, str(result.inserted_id), "images"), exist_ok=True)
        
        pytoken = jwt.encode({
            "user_id": str(result.inserted_id),
            "username": user_document["username"],
            "email": user_document["email"]}, secretToken, algorithm="HS256")
        #print(pytoken)
        return pytoken
    except Exception as e:
        await collection.delete_one({"_id": result.inserted_id})
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/login")
async def login(email: str = Form(...), password: str = Form(...)):
    try:
        user_details = await get_user(email)
        if not user_details:
            raise HTTPException(status_code=401, detail="Invalid Credentials!")
        
        stored_pw = user_details["password"]
        if isinstance(stored_pw, str):
            stored_pw = stored_pw.encode("utf-8")

        if not bcrypt.checkpw(password.encode("utf-8"), stored_pw):
            raise HTTPException(status_code=401, detail="Invalid Credentials!")

        pytoken = jwt.encode({
            "user_id": user_details["id"],
            "username": user_details["username"],
            "email": user_details["email"]
        }, secretToken, algorithm="HS256")

        return {"token": pytoken}

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/addImages")
async def addImages(token: str = Form(...), names: List[str] = Form(...), images: List[UploadFile] = File(...)):
    userId = tokenToUserId(token)
    if not await getUserById(userId):
        raise HTTPException(status_code=401, detail="Invalid UserId!")

    if len(names) != len(images):
        raise HTTPException(status_code=400, detail="names and images count must match")

    userFolder = os.path.join(usersFolder, userId, "images")
    for i, personName in enumerate(names):
        personFolder = os.path.join(userFolder, personName)
        os.makedirs(personFolder, exist_ok=True)

        filePath = os.path.join(personFolder, images[i].filename)

        with open(filePath, "wb") as f:
            f.write(await images[i].read())  
    return {"message": "Images uploaded successfully"}

@app.post("/processVideo")
async def processVideoWeb(
    token: str = Form(...), 
    video: UploadFile = File(...), 
    background_tasks: BackgroundTasks = None
):
    userId = tokenToUserId(token)
    if not await getUserById(userId):
        raise HTTPException(status_code=401, detail="Invalid UserId!")

    userFolder = os.path.join(usersFolder, userId)

    # temporarily save input video
    inputVideoPath = os.path.join(userFolder, video.filename)
    with open(inputVideoPath, "wb") as f:
        f.write(await video.read())

    # output path
    outputVideoPath = os.path.join(userFolder, "output_" + video.filename)
    processVideo(videoPath=inputVideoPath, userFolderPath=userFolder, outputVideoPath=outputVideoPath)

    # schedule cleanup
    background_tasks.add_task(cleanup_files, [inputVideoPath, outputVideoPath])

    # send file response
    return FileResponse(
        outputVideoPath,
        media_type="video/mp4",   # fallback (see below for auto-detect)
        filename="processed_" + video.filename
    )

@app.get("/makeModel")
async def makeModel(token: str):
    userId = tokenToUserId(token)
    if not await getUserById(userId):
        raise HTTPException(status_code=401, detail="Invalid UserId!")

    userFolder = os.path.join(usersFolder, userId)

    createModelScratch(userFolder)

    return {"status": "Model remade successfully"}

@app.get("/getUserImageDetails")
async def getUserImageDetails(token: str):
    userId = tokenToUserId(token)
    if not await getUserById(userId):
        raise HTTPException(status_code=401, detail="Invalid UserId!")
    imagesFolder = os.path.join(usersFolder, userId, "images")
    details = {}
    for personName in os.listdir(imagesFolder):
        personFolder = os.path.join(imagesFolder, personName)
        if not os.path.isdir(personFolder):
            continue
        details[personName] = {
            "image_count": len(os.listdir(personFolder)),
            "images": os.listdir(personFolder)
        }
    return details

@app.get('/getSpecificImage')
async def getSpecificImage(token: str, personName: str, imageName: str):
    userId = tokenToUserId(token)
    if not await getUserById(userId):
        raise HTTPException(status_code=401, detail="Invalid UserId!")

    imagePath = os.path.join(usersFolder, userId, "images", personName, imageName)
    if not os.path.exists(imagePath):
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(imagePath)

import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
