# backend/app/firebase.py
import firebase_admin
from firebase_admin import credentials, db
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin
def initialize_firebase():
    try:
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        database_url = os.getenv("FIREBASE_DATABASE_URL")
        
        if not cred_path:
            raise ValueError("FIREBASE_CREDENTIALS_PATH not found in .env")
        if not database_url:
            raise ValueError("FIREBASE_DATABASE_URL not found in .env")
        
        cred = credentials.Certificate(cred_path)
        
        # Initialize with Realtime Database URL
        firebase_admin.initialize_app(cred, {
            'databaseURL': database_url
        })
        
        print("✅ Firebase Realtime Database initialized successfully!")
        return True
    
    except Exception as e:
        print(f"❌ Firebase initialization error: {e}")
        return False

# Initialize Firebase
firebase_initialized = initialize_firebase()

# Function to get database reference
def get_db():
    """Get a reference to the Realtime Database"""
    if not firebase_initialized:
        raise Exception("Firebase not initialized")
    return db.reference()