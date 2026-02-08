from fastapi import HTTPException, status
from firebase_admin import db

def verify_admin(admin_uid: str) -> dict:
    """
    Verify if a user is an admin
    
    Args:
        admin_uid: UID of the user trying to access admin features
        
    Returns:
        User profile if admin, raises exception otherwise
        
    Raises:
        HTTPException: If user not found or not an admin
    """
    try:
        # Get user from database
        user_ref = db.reference(f'users/{admin_uid}')
        user = user_ref.get()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if user has admin role
        user_role = user.get('role', 'user')
        
        if user_role != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # Add UID to user data
        user['uid'] = admin_uid
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
        )