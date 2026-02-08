# backend/app/routes/user_routes.py

from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from firebase_admin import db
from ..models.user import UserCreate, UserUpdate
import time

# Create router
router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


# ✅ GET ALL USERS (WITHOUT STRICT VALIDATION)
@router.get("/")
async def get_all_users():
    """
    Get all users from Realtime Database.
    Used by: AI Matching Engine, Admin Dashboard
    Returns: List of user dictionaries (no strict validation)
    """
    try:
        # Get reference to users node
        users_ref = db.reference('users')
        users_data = users_ref.get()
        
        if not users_data:
            return []
        
        user_list = []
        for uid, user_data in users_data.items():
            # Ensure uid is in the data
            if isinstance(user_data, dict):
                user_data['uid'] = uid
                user_list.append(user_data)
        
        return user_list
    
    except Exception as e:
        print(f"❌ Error fetching users: {str(e)}")
        import traceback
        traceback.print_exc()  # Print full error for debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching users: {str(e)}"
        )


# ✅ GET SINGLE USER BY UID (WITHOUT STRICT VALIDATION)
@router.get("/{uid}")
async def get_user(uid: str):
    """
    Get a specific user by their UID.
    Used by: Profile pages, User details
    Returns: User dictionary (no strict validation)
    """
    try:
        user_ref = db.reference(f'users/{uid}')
        user_data = user_ref.get()
        
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with UID '{uid}' not found"
            )
        
        # Ensure uid is in the data
        if isinstance(user_data, dict):
            user_data['uid'] = uid
        
        return user_data
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching user: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user: {str(e)}"
        )


# ✅ CREATE NEW USER (WITH VALIDATION)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, uid: str):
    """
    Create a new user profile.
    Used by: Signup process (after OTP verification on frontend)
    
    Query parameter: uid (from Firebase Auth - obtained after OTP verification)
    """
    try:
        # Check if user already exists
        user_ref = db.reference(f'users/{uid}')
        existing_user = user_ref.get()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with UID '{uid}' already exists"
            )
        
        # Get current timestamp in milliseconds
        current_time = int(time.time() * 1000)
        
        # Prepare user data with EXACT structure
        user_data = {
            'uid': uid,
            'fullName': user.fullName,
            'email': user.email,
            'phone': user.phone,
            'skillsOffered': user.skillsOffered,
            'skillsNeeded': user.skillsNeeded,
            'location': {
                'city': user.location.city,
                'area': user.location.area
            },
            'exchangeMode': user.exchangeMode,
            'availability': {
                'days': user.availability.days,
                'time': user.availability.time
            },
            'bio': user.bio or "",
            'profileCompleted': True,
            'role': 'user',  # Always 'user' for new signups
            'socialLinks': {
                'dropbox': user.socialLinks.dropbox if user.socialLinks else "",
                'googleDrive': user.socialLinks.googleDrive if user.socialLinks else "",
                'linkedin': user.socialLinks.linkedin if user.socialLinks else "",
                'portfolio': user.socialLinks.portfolio if user.socialLinks else ""
            },
            'status': {
                'online': True,
                'lastSeen': current_time
            },
            'createdAt': current_time,
            'updatedAt': current_time
        }
        
        # Save to Realtime Database
        user_ref.set(user_data)
        
        print(f"✅ User created successfully: {uid}")
        
        # Return created user
        return user_data
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating user: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )


# ✅ UPDATE USER
@router.put("/{uid}")
async def update_user(uid: str, user_data: UserUpdate):
    """
    Update user profile.
    Used by: Profile setup, Profile edit
    """
    try:
        user_ref = db.reference(f'users/{uid}')
        existing_user = user_ref.get()
        
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with UID '{uid}' not found"
            )
        
        # Get current timestamp
        current_time = int(time.time() * 1000)
        
        # Convert Pydantic model to dict, excluding unset fields
        update_data = user_data.dict(exclude_unset=True)
        
        # Add updatedAt timestamp
        update_data['updatedAt'] = current_time
        
        # ✅ CRITICAL: Ensure profileCompleted is set
        if 'profileCompleted' not in update_data:
            update_data['profileCompleted'] = True
        
        # Update in Firebase
        user_ref.update(update_data)
        
        # Get updated user
        updated_user = user_ref.get()
        updated_user['uid'] = uid
        
        print(f"✅ User updated successfully: {uid}")
        
        return updated_user
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating user: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user: {str(e)}"
        )

# ✅ DELETE USER
@router.delete("/{uid}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(uid: str):
    """
    Delete a user from the database.
    Used by: Admin panel, Account deletion
    """
    try:
        user_ref = db.reference(f'users/{uid}')
        existing_user = user_ref.get()
        
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with UID '{uid}' not found"
            )
        
        user_ref.delete()
        
        print(f"✅ User deleted successfully: {uid}")
        
        return None  # 204 No Content
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting user: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting user: {str(e)}"
        )


# ✅ UPDATE USER STATUS (online/offline)
@router.patch("/{uid}/status")
async def update_user_status(uid: str, online: bool):
    """
    Update user's online status.
    Used by: Frontend when user logs in/out
    """
    try:
        user_ref = db.reference(f'users/{uid}')
        existing_user = user_ref.get()
        
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with UID '{uid}' not found"
            )
        
        current_time = int(time.time() * 1000)
        
        # Update status
        user_ref.child('status').update({
            'online': online,
            'lastSeen': current_time
        })
        
        # Also update updatedAt
        user_ref.update({
            'updatedAt': current_time
        })
        
        print(f"✅ User status updated: {uid} - online: {online}")
        
        return {
            "message": "Status updated successfully",
            "uid": uid,
            "online": online
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating status: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating status: {str(e)}"
        )