# backend/app/services/suggestion_service.py

from typing import List, Dict, Any
from collections import Counter

class SuggestionService:
    """
    AI-powered skill suggestion service
    Platform-wide analysis of trending skills (same for all users)
    """
    
    def get_trending_skills_for_user(self, user: Dict, all_users: List[Dict]) -> Dict[str, Any]:
        """
        Get top 3 trending skills based on PLATFORM-WIDE demand
        Same results for all users on the platform
        
        Args:
            user: Current user's profile (used only to exclude them from analysis)
            all_users: List of all platform users
            
        Returns:
            {
                'trendingSkills': [
                    {'skill': 'Web Development', 'rank': 1, 'icon': '🔥', 'demandCount': 5, 'supplyCount': 2, 'gap': 3}
                ],
                'message': 'Most in-demand skills on SwapNova',
                'scope': 'platform'
            }
        """
        
        # Exclude current user from analysis
        other_users = [u for u in all_users if u.get('uid') != user.get('uid')]
        
        if len(other_users) == 0:
            return {
                'trendingSkills': [],
                'message': 'No other users yet',
                'scope': 'platform',
                'totalUsersAnalyzed': 0
            }
        
        # Analyze platform-wide skills
        trending_skills = self._analyze_skills(other_users)
        
        # Return top 3
        top_3 = trending_skills[:3]
        
        # Add icons and ranks
        icons = ["🔥", "📈", "⭐", "💡", "🎯"]
        for i, skill in enumerate(top_3):
            skill['rank'] = i + 1
            skill['icon'] = icons[i] if i < len(icons) else "✨"
        
        return {
            'trendingSkills': top_3,
            'message': 'Most in-demand skills on SwapNova',
            'scope': 'platform',
            'totalUsersAnalyzed': len(other_users)
        }
    
    def _analyze_skills(self, users: List[Dict]) -> List[Dict]:
        """
        Analyze platform-wide skills and find highest demand-supply gaps
        
        Logic:
        - Count how many users NEED each skill (demand)
        - Count how many users OFFER each skill (supply)
        - Calculate gap = demand - supply
        - Return skills sorted by gap (highest first)
        
        Skills with higher gap = more in-demand (trending)
        
        Returns list of skills sorted by demand gap (highest first)
        """
        
        # Count how many times each skill is needed
        skills_needed = []
        for user in users:
            skills_needed.extend([s.strip() for s in user.get('skillsNeeded', [])])
        
        # Count how many times each skill is offered
        skills_offered = []
        for user in users:
            skills_offered.extend([s.strip() for s in user.get('skillsOffered', [])])
        
        # Count occurrences
        needed_count = Counter(skills_needed)
        offered_count = Counter(skills_offered)
        
        # Calculate gap for each skill that exists on platform
        all_skills = set(needed_count.keys()) | set(offered_count.keys())
        
        skill_analysis = []
        for skill in all_skills:
            demand = needed_count.get(skill, 0)
            supply = offered_count.get(skill, 0)
            gap = demand - supply
            
            # Include ALL skills (even if gap is 0 or negative)
            # But prioritize skills with positive gap (more demand than supply)
            skill_analysis.append({
                'skill': skill,
                'demandCount': demand,
                'supplyCount': supply,
                'gap': gap
            })
        
        # Sort by:
        # 1. Gap (highest first - skills in most demand)
        # 2. Total demand (if gap is same, show skills with more total demand)
        skill_analysis.sort(key=lambda x: (x['gap'], x['demandCount']), reverse=True)
        
        return skill_analysis