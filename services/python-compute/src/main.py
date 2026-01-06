from fastapi import FastAPI
import os

app = FastAPI(title="Python Compute Service")

@app.get("/")
async def root():
    return {"message": "Python compute service is running", "service": "python-compute"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

