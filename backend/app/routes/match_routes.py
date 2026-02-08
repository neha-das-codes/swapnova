# backend/app/routes/match_routes.py
from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from firebase_admin import db
from ..services.matching_service import MatchingService

# Create router
router = APIRouter(
    prefix="/api/matches",
    tags=["AI Matching"]
)

# Initialize matching service
matching_service = MatchingService()


@router.get("/{uid}")
async def get_matches_for_user(uid: str, limit: int = 10):
    """
    Get AI-powered matches for a specific user
    
    Args:
        uid: User ID to find matches for
        limit: Maximum number of matches to return (default: 10)
        
    Returns:
        List of top matches with scores, reasons, and user profiles
    """
    try:
        # Get the current user
        user_ref = db.reference(f'users/{uid}')
        current_user = user_ref.get()
        
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with UID '{uid}' not found"
            )
        
        # Add uid to current user data
        current_user['uid'] = uid
        
        # Get all users
        all_users_ref = db.reference('users')
        all_users_data = all_users_ref.get()
        
        if not all_users_data:
            return []
        
        # Convert to list and add UIDs
        all_users = []
        for user_id, user_data in all_users_data.items():
            if isinstance(user_data, dict):
                user_data['uid'] = user_id
                all_users.append(user_data)
        
        # Get top matches using AI matching service
        matches = matching_service.get_top_matches(
            current_user=current_user,
            all_users=all_users,
            limit=limit
        )
        
        print(f"✅ Found {len(matches)} matches for user {uid}")
        
        return matches
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error finding matches: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error finding matches: {str(e)}"
        )


@router.get("/{uid}/detailed")
async def get_detailed_match(uid: str, match_uid: str):
    """
    Get detailed match information between two specific users
    
    Args:
        uid: Current user ID
        match_uid: Potential match user ID
        
    Returns:
        Detailed match breakdown with scores for each category
    """
    try:
        # Get both users
        user1_ref = db.reference(f'users/{uid}')
        user2_ref = db.reference(f'users/{match_uid}')
        
        user1 = user1_ref.get()
        user2 = user2_ref.get()
        
        if not user1:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with UID '{uid}' not found"
            )
        
        if not user2:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with UID '{match_uid}' not found"
            )
        
        # Add UIDs
        user1['uid'] = uid
        user2['uid'] = match_uid
        
        # Calculate match score
        match_result = matching_service.calculate_match_score(user1, user2)
        
        return {
            'matchScore': match_result['score'],
            'matchPercentage': match_result['percentage'],
            'reasons': match_result['reasons'],
            'skillsYouNeed': match_result['skillsUserNeedsFromMatch'],
            'skillsTheyNeed': match_result['skillsMatchNeedsFromUser'],
            'currentUser': {
                'uid': user1['uid'],
                'fullName': user1.get('fullName'),
                'skillsOffered': user1.get('skillsOffered', []),
                'skillsNeeded': user1.get('skillsNeeded', [])
            },
            'matchUser': {
                'uid': user2['uid'],
                'fullName': user2.get('fullName'),
                'skillsOffered': user2.get('skillsOffered', []),
                'skillsNeeded': user2.get('skillsNeeded', [])
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting detailed match: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting detailed match: {str(e)}"
        )