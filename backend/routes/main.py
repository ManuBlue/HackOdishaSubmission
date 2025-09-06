from fastapi import FastAPI

app = FastAPI(title="My First FastAPI App")
url = "placeholder"
@app.post("/")
def login():
    
    return {"message": "Hello, FastAPI!"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "query": q}
