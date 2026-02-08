# backend/app/firebase.py
import firebase_admin
from firebase_admin import credentials, db
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin
def initialize_firebase():
    try:
        # Check if running on Render (has FIREBASE_CREDENTIALS env var)
        firebase_creds_str = os.getenv('FIREBASE_CREDENTIALS')
        database_url = os.getenv("FIREBASE_DATABASE_URL")
        
        if firebase_creds_str:
            # Running on Render - use environment variable (JSON string)
            print("🔧 Using Firebase credentials from environment variable...")
            firebase_creds = json.loads(firebase_creds_str)
            cred = credentials.Certificate(firebase_creds)
        else:
            # Running locally - use file path
            print("🔧 Using Firebase credentials from file...")
            cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json")
            cred = credentials.Certificate(cred_path)
        
        # Get database URL from environment or use default
        if not database_url:
            print("⚠️ Warning: FIREBASE_DATABASE_URL not set, using default")
            database_url = "https://swapnova-default.firebaseio.com"  # Temporary - we'll set proper one
        
        # Initialize with Realtime Database URL
        firebase_admin.initialize_app(cred, {
            'databaseURL': database_url
        })
        
        print("✅ Firebase Realtime Database initialized successfully!")
        print(f"✅ Database URL: {database_url}")
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