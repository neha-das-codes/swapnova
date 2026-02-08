from typing import List, Dict, Any, Set
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class MatchingService:
    """
    AI-powered matching service that calculates compatibility scores
    between users based on skills, location, availability, and preferences.
    ONLY RETURNS TWO-WAY SKILL EXCHANGES.
    """
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
    
    def calculate_match_score(self, user1: Dict[str, Any], user2: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate match score between two users (0-100 scale)
        
        Returns:
            {
                'score': float,
                'percentage': str,
                'reasons': list,
                'skillsUserNeedsFromMatch': list,
                'skillsMatchNeedsFromUser': list
            }
        """
        
        total_score = 0
        reasons = []
        
        # 1. SKILL COMPATIBILITY (40 points) - Most important!
        skill_score, skill_reasons, skills_user_needs, skills_match_needs = self._calculate_skill_match(user1, user2)
        
        # ✅ CRITICAL: If not a two-way exchange, return 0 score immediately
        if skill_score == 0:
            return {
                'score': 0,
                'percentage': "0%",
                'reasons': ["❌ Not a two-way skill exchange"],
                'skillsUserNeedsFromMatch': [],
                'skillsMatchNeedsFromUser': []
            }
        
        total_score += skill_score
        reasons.extend(skill_reasons)
        
        # 2. LOCATION MATCH (20 points)
        location_score, location_reasons = self._calculate_location_match(user1, user2)
        total_score += location_score
        reasons.extend(location_reasons)
        
        # 3. EXCHANGE MODE COMPATIBILITY (15 points)
        mode_score, mode_reasons = self._calculate_exchange_mode_match(user1, user2)
        total_score += mode_score
        reasons.extend(mode_reasons)
        
        # 4. AVAILABILITY OVERLAP (15 points)
        availability_score, availability_reasons = self._calculate_availability_match(user1, user2)
        total_score += availability_score
        reasons.extend(availability_reasons)
        
        # 5. USER RATING BONUS (10 points)
        rating_score, rating_reasons = self._calculate_rating_bonus(user2)
        total_score += rating_score
        reasons.extend(rating_reasons)
        
        # 6. ML ENHANCEMENT - Adjust score based on skill text similarity
        ml_boost = self._calculate_ml_boost(user1, user2)
        total_score += ml_boost
        
        # Ensure score is between 0-100
        final_score = max(0, min(100, total_score))
        
        return {
            'score': round(final_score, 1),
            'percentage': f"{round(final_score)}%",
            'reasons': reasons,
            'skillsUserNeedsFromMatch': skills_user_needs,
            'skillsMatchNeedsFromUser': skills_match_needs
        }
    
    def _calculate_skill_match(self, user1: Dict, user2: Dict) -> tuple:
        """
        Calculate skill compatibility (40 points max)
        ✅ ONLY RETURNS SCORE FOR TWO-WAY EXCHANGES
        """
        score = 0
        reasons = []
        
        user1_needs = set([s.lower().strip() for s in user1.get('skillsNeeded', [])])
        user1_offers = set([s.lower().strip() for s in user1.get('skillsOffered', [])])
        user2_needs = set([s.lower().strip() for s in user2.get('skillsNeeded', [])])
        user2_offers = set([s.lower().strip() for s in user2.get('skillsOffered', [])])
        
        # What user1 needs that user2 can offer
        skills_user_gets = list(user1_needs & user2_offers)
        # What user2 needs that user1 can offer
        skills_user_gives = list(user2_needs & user1_offers)
        
        # ✅ CHANGED: Only proceed if BOTH conditions are met (two-way exchange)
        if not skills_user_gets or not skills_user_gives:
            # Return 0 score to filter out this match completely
            return 0, [], [], []
        
        # If we reach here, it's a two-way exchange ✅
        score = 40  # Full 40 points for two-way exchange
        
        reasons.append(f"✨ Two-way exchange!")
        reasons.append(f"You learn: {', '.join(skills_user_gets[:3])}")
        reasons.append(f"You teach: {', '.join(skills_user_gives[:3])}")
        
        return score, reasons, skills_user_gets, skills_user_gives
    
    def _calculate_location_match(self, user1: Dict, user2: Dict) -> tuple:
        """Calculate location compatibility (20 points max)"""
        score = 0
        reasons = []
        
        loc1 = user1.get('location', {})
        loc2 = user2.get('location', {})
        mode1 = user1.get('exchangeMode', '')
        mode2 = user2.get('exchangeMode', '')
        
        # If both prefer online, location doesn't matter
        if mode1 == 'Online' and mode2 == 'Online':
            score = 20
            reasons.append("🌐 Both prefer online meetings")
            return score, reasons
        
        # If either prefers offline or both, check location
        if mode1 in ['Offline', 'Both'] or mode2 in ['Offline', 'Both']:
            city1 = loc1.get('city', '').lower().strip()
            city2 = loc2.get('city', '').lower().strip()
            area1 = loc1.get('area', '').lower().strip()
            area2 = loc2.get('area', '').lower().strip()
            
            if city1 and city2 and city1 == city2:
                score += 15
                reasons.append(f"📍 Same city: {loc1.get('city')}")
                
                # Bonus for same area
                if area1 and area2 and area1 == area2:
                    score += 5
                    reasons.append(f"📍 Same area: {loc1.get('area')}")
            else:
                reasons.append("⚠️ Different cities (for offline meetings)")
        
        return score, reasons
    
    def _calculate_exchange_mode_match(self, user1: Dict, user2: Dict) -> tuple:
        """Calculate exchange mode compatibility (15 points max)"""
        score = 0
        reasons = []
        
        mode1 = user1.get('exchangeMode', '')
        mode2 = user2.get('exchangeMode', '')
        
        if mode1 == mode2:
            score = 15
            reasons.append(f"✅ Both prefer {mode1} exchanges")
        elif mode1 == 'Both' or mode2 == 'Both':
            score = 10
            reasons.append("✅ Flexible exchange modes")
        else:
            reasons.append(f"⚠️ Mode mismatch: You prefer {mode1}, they prefer {mode2}")
        
        return score, reasons
    
    def _calculate_availability_match(self, user1: Dict, user2: Dict) -> tuple:
        """Calculate availability overlap (15 points max)"""
        score = 0
        reasons = []
        
        avail1 = user1.get('availability', {})
        avail2 = user2.get('availability', {})
        
        days1 = set([d.lower().strip() for d in avail1.get('days', [])])
        days2 = set([d.lower().strip() for d in avail2.get('days', [])])
        time1 = set([t.lower().strip() for t in avail1.get('time', [])])
        time2 = set([t.lower().strip() for t in avail2.get('time', [])])
        
        # Common days (max 8 points)
        common_days = days1 & days2
        if common_days:
            day_score = min(len(common_days) * 2, 8)
            score += day_score
            reasons.append(f"📅 Available on: {', '.join(list(common_days)[:3])}")
        
        # Common time slots (max 7 points)
        common_times = time1 & time2
        if common_times:
            time_score = min(len(common_times) * 2, 7)
            score += time_score
            reasons.append(f"🕒 Available at: {', '.join(list(common_times))}")
        
        if not common_days and not common_times:
            reasons.append("⚠️ No overlapping availability")
        
        return score, reasons
    
    def _calculate_rating_bonus(self, user2: Dict) -> tuple:
        """Calculate bonus based on user rating (10 points max)"""
        score = 0
        reasons = []
        
        rating = user2.get('rating', 0)
        
        if rating >= 4.5:
            score = 10
            reasons.append(f"⭐ Highly rated user ({rating}/5)")
        elif rating >= 4.0:
            score = 7
            reasons.append(f"⭐ Well-rated user ({rating}/5)")
        elif rating >= 3.5:
            score = 5
            reasons.append(f"⭐ Rated {rating}/5")
        elif rating > 0:
            score = 3
            reasons.append(f"⭐ Rated {rating}/5")
        else:
            reasons.append("🆕 New user (no ratings yet)")
        
        return score, reasons
    
    def _calculate_ml_boost(self, user1: Dict, user2: Dict) -> float:
        """
        ML Enhancement: Use TF-IDF and cosine similarity 
        to find semantic similarity in skill descriptions
        Returns: 0-5 point boost
        """
        try:
            # Combine skills into text
            user1_text = ' '.join(user1.get('skillsOffered', []) + user1.get('skillsNeeded', []))
            user2_text = ' '.join(user2.get('skillsOffered', []) + user2.get('skillsNeeded', []))
            
            if not user1_text or not user2_text:
                return 0
            
            # Calculate text similarity
            vectors = self.vectorizer.fit_transform([user1_text, user2_text])
            similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
            
            # Convert similarity (0-1) to boost (0-5)
            boost = similarity * 5
            
            return boost
        except:
            return 0
    
    def get_top_matches(self, current_user: Dict, all_users: List[Dict], limit: int = 10) -> List[Dict]:
        """
        Get top N matches for a user
        ✅ ONLY RETURNS TWO-WAY SKILL EXCHANGES
        
        Args:
            current_user: The user to find matches for
            all_users: List of all users in the system
            limit: Number of top matches to return
            
        Returns:
            List of match objects sorted by score (highest first)
        """
        matches = []
        current_user_id = current_user.get('uid')
        
        for user in all_users:
            # Skip self
            if user.get('uid') == current_user_id:
                continue
            
            # Calculate match score
            match_result = self.calculate_match_score(current_user, user)
            
            # ✅ CHANGED: Only include matches with score > 0 (filters out one-way exchanges)
            # Previously was > 20, now > 0 because we return 0 for non-two-way exchanges
            if match_result['score'] > 0:
                matches.append({
                    'userId': user.get('uid'),
                    'matchScore': match_result['score'],
                    'matchPercentage': match_result['percentage'],
                    'reasons': match_result['reasons'],
                    'skillsYouNeed': match_result['skillsUserNeedsFromMatch'],
                    'skillsTheyNeed': match_result['skillsMatchNeedsFromUser'],
                    'user': user  # Full user profile
                })
        
        # Sort by score (highest first)
        matches.sort(key=lambda x: x['matchScore'], reverse=True)
        
        # Return top N matches
        return matches[:limit]