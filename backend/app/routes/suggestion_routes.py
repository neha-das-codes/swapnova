# backend/app/routes/suggestion_routes.py

from fastapi import APIRouter, HTTPException, status
from firebase_admin import db
from ..services.suggestion_service import SuggestionService

# Create router
router = APIRouter(
    prefix="/api/suggestions",
    tags=["AI Suggestions"]
)

# Initialize suggestion service
suggestion_service = SuggestionService()


@router.get("/{uid}")
async def get_skill_suggestions(uid: str):
    """
    Get AI-powered skill suggestions for a user
    
    Returns top 3 trending skills based on:
    - User's location (if enough users in area)
    - Platform-wide demand (fallback)
    
    Args:
        uid: User ID to get suggestions for
        
    Returns:
        {
            'trendingSkills': [
                {'rank': 1, 'skill': 'React', 'icon': '🔥', 'demandCount': 5, 'supplyCount': 2, 'gap': 3}
            ],
            'userLocation': 'Mumbai',
            'message': 'Popular in your area'
        }
    """
    try:
        # Get current user
        user_ref = db.reference(f'users/{uid}')
        current_user = user_ref.get()
        
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with UID '{uid}' not found"
            )
        
        current_user['uid'] = uid
        
        # Get all users
        all_users_ref = db.reference('users')
        all_users_data = all_users_ref.get()
        
        if not all_users_data:
            return {
                'trendingSkills': [],
                'userLocation': current_user.get('location', {}).get('city', 'Unknown'),
                'message': 'Not enough data yet',
                'scope': 'none'
            }
        
        # Convert to list
        all_users = []
        for user_id, user_data in all_users_data.items():
            if isinstance(user_data, dict):
                user_data['uid'] = user_id
                all_users.append(user_data)
        
        # Get trending skills
        suggestions = suggestion_service.get_trending_skills_for_user(
            user=current_user,
            all_users=all_users
        )
        
        print(f"✅ Generated {len(suggestions['trendingSkills'])} suggestions for user {uid}")
        
        return suggestions
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating suggestions: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating suggestions: {str(e)}"
        )