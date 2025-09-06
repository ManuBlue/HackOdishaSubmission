from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Dict
import bcrypt

import os
app = FastAPI()
url = "placeholder"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)
client = AsyncIOMotorClient("PUT MONGODB URI HERE !!!")  
db = client['cctv_processing']
collection = db['User_credentials']
currDirectory = os.path.dirname(os.path.abspath(__file__))
usersFolder = os.path.join(currDirectory,"../","database","users")

async def get_user(email:str):
    user_data = await collection.find_one({"email": email})
    if user_data:
        user_data["id"] = str(user_data["id"])
        return user_data

async def hash_password(user:Dict):
    bytes_pw = user["password"].encode("utf-8")
    hashed_pw = await bcrypt.hashpw(bytes_pw, bcrypt.gensalt(rounds=12))
    user["password"] = hashed_pw
    return user

@app.post("/login")
async def login(user:Dict = Depends(hash_password)):
    req_bytes_pw = user["password"].encode("utf-8")
    user_details = await get_user(user['email'])
    if (not user_details) or bcrypt.checkpw(req_bytes_pw, user_details["password"]):
        raise HTTPException(status_code=404, detail="Invalid Credentials!")
    os.makedirs(os.path.join(usersFolder,user_details['id']), exist_ok=True)
    os.makedirs(os.path.join(usersFolder,user_details['id'],"images"), exist_ok=True)
    return {"user_id": user_details["id"], "username": user_details["username"], "email": user_details["email"]}

@app.post("/addsamples")
async def add_samples(user_id: str, username: str, email:str):
    pass


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "query": q}
