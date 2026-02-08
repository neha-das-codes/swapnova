# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from .firebase import firebase_initialized  # ← CHANGED THIS LINE
from .routes import user_routes
from .routes import match_routes
from .routes import suggestion_routes 
from .routes import admin_routes
# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="SwapNova API",
    description="AI-powered skill exchange platform",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register user routes
app.include_router(user_routes.router)
app.include_router(match_routes.router)
app.include_router(suggestion_routes.router) 
app.include_router(admin_routes.router)

@app.on_event("startup")
async def startup_event():
    if firebase_initialized:
        print("✅ Backend ready with Firebase Realtime Database connection!")
        print("✅ AI Matching Engine loaded!")
        print("✅ AI Skill Suggestions loaded!") 
        print("✅ Admin Dashboard loaded!")
    else:
        print("⚠️ Backend started but Firebase connection failed!")

@app.get("/")
def read_root():
    return {
        "message": "SwapNova API is running!",
        "version": "1.0.0",
        "status": "healthy",
        "firebase": "connected" if firebase_initialized else "disconnected"
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "firebase": "connected" if firebase_initialized else "disconnected"
    }