import os
from fastapi import FastAPI, HTTPException, Form, UploadFile, File,BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
from bson import ObjectId
from typing import  List
from fastapi.responses import FileResponse
import jwt
import cv2
import numpy as np
from ultralytics import YOLO
import face_recognition
from recognize import recognizePerson
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
@app.get("/deleteSpecificImage")
async def deleteSpecificImage(token: str, personName: str, imageName: str):
    userId = tokenToUserId(token)
    if not await getUserById(userId):
        raise HTTPException(status_code=401, detail="Invalid UserId!")

    imagePath = os.path.join(usersFolder, userId, "images", personName, imageName)
    if not os.path.exists(imagePath):
        raise HTTPException(status_code=404, detail="Image not found")

    os.remove(imagePath)
    return {"message": "Image deleted successfully"}
import asyncio

@app.websocket("/ws/realtime")
async def realtime_feed(websocket: WebSocket):
    await websocket.accept()

    # Models / state
    yoloModel = YOLO("yolo11n.pt")
    idToConfidence = {}
    frame_count = 0

    latest_frame = None
    frame_event = asyncio.Event()
    userFolderPath = None
    receiver_task = None

    async def receiver():
        nonlocal latest_frame, userFolderPath
        try:
            # --- Expect first message to be token (text) ---
            try:
                first_msg = await asyncio.wait_for(websocket.receive(), timeout=2.0)
            except asyncio.TimeoutError:
                return

            # Extract token from the first message
            token_msg = None
            if "text" in first_msg and first_msg["text"] is not None:
                token_msg = first_msg["text"]
            elif "bytes" in first_msg and first_msg["bytes"] is not None:
                # If client accidentally sent bytes first, try to read a text next
                try:
                    token_msg = await websocket.receive_text()
                except Exception:
                    print("Expected token text as first message, got bytes. Closing.")
                    await websocket.close(code=4002)
                    return
            else:
                # Fallback
                try:
                    token_msg = await websocket.receive_text()
                except Exception:
                    await websocket.close(code=4002)
                    return

            token = (token_msg or "").strip()
            userId = tokenToUserId(token)
            if not await getUserById(userId):
                await websocket.close(code=4001)
                return
            userFolderPath = os.path.join(usersFolder, userId)

            # --- Now receive frames / control messages ---
            while True:
                try:
                    message = await asyncio.wait_for(websocket.receive(), timeout=2.0)
                except asyncio.TimeoutError:
                    continue  # Allows cancellation to be checked

                # client closed connection
                if message.get("type") == "websocket.disconnect":
                    break

                # binary frame
                if "bytes" in message and message["bytes"] is not None:
                    try:
                        nparr = np.frombuffer(message["bytes"], np.uint8)
                        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                        if frame is not None:
                            latest_frame = frame
                            frame_event.set()
                    except Exception as e:
                        print("frame decode error:", e)
                        # skip malformed frames
                        continue

                # text / control message
                elif "text" in message and message["text"] is not None:
                    txt = message["text"].strip().lower()
                    # optional control processing: "pause", "resume", "close", etc.
                    if txt == "close":
                        try:
                            await websocket.close()
                        except Exception:
                            pass
                        break
                    # ignore other text for now
                    continue

                else:
                    # unknown message type - ignore
                    continue

        except WebSocketDisconnect:
            return
        except Exception as exc:
            # ensure exceptions inside the task do not become "Task exception was never retrieved"
            print("Receiver task error:", exc)
            return

    # start the receiver task
    receiver_task = asyncio.create_task(receiver())

    try:
        while True:
            # wait until a new frame is available
            await frame_event.wait()
            frame_event.clear()
            frame = latest_frame
            if frame is None:
                continue

            # Run detection (YOLO)
            try:
                results = yoloModel.track(frame, persist=True)
            except Exception as e:
                print("YOLO tracking error:", e)
                # still try to send the raw frame back
                _, jpeg = cv2.imencode('.jpg', frame)
                await websocket.send_bytes(jpeg.tobytes())
                frame_count += 1
                continue

            if results and results[0] is not None:
                result = results[0]
                for box in result.boxes:
                    classId = int(box.cls[0])
                    if classId != 0:
                        continue

                    trackingID = int(box.id[0])
                    if trackingID not in idToConfidence:
                        idToConfidence[trackingID] = ("Unknown", 0.0)

                    x1, y1, x2, y2 = map(int, box.xyxy[0])

                    # clamp coords to frame bounds (avoid crashes)
                    h, w = frame.shape[:2]
                    x1 = max(0, min(w - 1, x1))
                    x2 = max(0, min(w - 1, x2))
                    y1 = max(0, min(h - 1, y1))
                    y2 = max(0, min(h - 1, y2))

                    # Only run recognition every 10 frames
                    if frame_count % 10 == 0:
                        try:
                            if x2 > x1 and y2 > y1:
                                personImage = frame[y1:y2, x1:x2]
                                if personImage.size != 0:
                                    rgbPersonImage = cv2.cvtColor(personImage, cv2.COLOR_BGR2RGB)
                                    encodings = face_recognition.face_encodings(rgbPersonImage)
                                    if encodings:
                                        faceEncoding = encodings[0]
                                        predictedPerson, confidence = recognizePerson(userFolderPath, faceEncoding)
                                        _, old_conf = idToConfidence.get(trackingID, ("Unknown", 0.0))
                                        if confidence > old_conf:
                                            idToConfidence[trackingID] = (predictedPerson, confidence)
                        except Exception as e:
                            # face cropping/encoding error -> skip this box
                            print("Face recognition error:", e)

                    # Draw bounding box and label (use last known)
                    predictedPerson, confidence = idToConfidence.get(trackingID, ("Unknown", 0.0))
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    label = f"{predictedPerson} ({confidence:.2f})"
                    cv2.putText(frame, label, (x1, max(y1 - 10, 0)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

            # Encode and send processed frame
            try:
                _, jpeg = cv2.imencode('.jpg', frame)
                await websocket.send_bytes(jpeg.tobytes())
            except Exception as e:
                print("Error sending frame:", e)
                # attempt to continue; if websocket truly closed, next operations will fail and exit
            frame_count += 1

    except WebSocketDisconnect:
        # client disconnected
        pass
    except Exception as e:
        print("Error in main loop:", e)
    finally:
        # cleanup receiver task
        if receiver_task:
            receiver_task.cancel()
            try:
                await receiver_task
            except Exception:
                pass
        try:
            await websocket.close()
        except Exception:
            pass


import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
