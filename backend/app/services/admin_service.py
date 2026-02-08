from typing import List, Dict, Any
from collections import Counter
from datetime import datetime, timedelta

class AdminService:
    """
    Service for admin dashboard operations
    Calculates statistics, analytics, and manages reports
    """
    
    def calculate_dashboard_stats(self, all_users: List[Dict], all_exchanges: List[Dict]) -> Dict[str, Any]:
        """
        Calculate main dashboard statistics
        
        Returns:
            {
                'totalUsers': int,
                'activeUsers': int,
                'totalExchanges': int,
                'completedExchanges': int,
                'successRate': float,
                'newUsersThisWeek': int,
                'newUsersThisMonth': int
            }
        """
        
        # Total users
        total_users = len(all_users)
        
        # Active users (online now)
        active_users = sum(1 for user in all_users if user.get('status', {}).get('online', False))
        
        # Total exchanges
        total_exchanges = len(all_exchanges)
        
        # Completed exchanges (both users marked complete)
        completed_exchanges = sum(1 for ex in all_exchanges if ex.get('fullyCompleted', False))
        
        # Success rate
        success_rate = (completed_exchanges / total_exchanges * 100) if total_exchanges > 0 else 0
        
        # New users this week/month
        now = datetime.now()
        one_week_ago = now - timedelta(days=7)
        one_month_ago = now - timedelta(days=30)
        
        new_users_week = 0
        new_users_month = 0
        
        for user in all_users:
            created_at = user.get('createdAt', 0)
            if created_at:
                # Convert milliseconds to datetime
                user_created = datetime.fromtimestamp(created_at / 1000)
                
                if user_created >= one_week_ago:
                    new_users_week += 1
                if user_created >= one_month_ago:
                    new_users_month += 1
        
        return {
            'totalUsers': total_users,
            'activeUsers': active_users,
            'totalExchanges': total_exchanges,
            'completedExchanges': completed_exchanges,
            'successRate': round(success_rate, 1),
            'newUsersThisWeek': new_users_week,
            'newUsersThisMonth': new_users_month
        }
    
    def calculate_skills_analytics(self, all_users: List[Dict]) -> Dict[str, Any]:
        """
        Analyze skills demand and supply across platform
        
        Returns:
            {
                'topOfferedSkills': [...],
                'topNeededSkills': [...],
                'skillsGap': [...]
            }
        """
        
        # Collect all skills
        skills_offered = []
        skills_needed = []
        
        for user in all_users:
            skills_offered.extend([s.strip() for s in user.get('skillsOffered', [])])
            skills_needed.extend([s.strip() for s in user.get('skillsNeeded', [])])
        
        # Count occurrences
        offered_count = Counter(skills_offered)
        needed_count = Counter(skills_needed)
        
        # Top offered skills
        top_offered = [
            {'skill': skill, 'count': count}
            for skill, count in offered_count.most_common(10)
        ]
        
        # Top needed skills
        top_needed = [
            {'skill': skill, 'count': count}
            for skill, count in needed_count.most_common(10)
        ]
        
        # Calculate skills gap (demand - supply)
        all_skills = set(needed_count.keys()) | set(offered_count.keys())
        
        skills_gap = []
        for skill in all_skills:
            demand = needed_count.get(skill, 0)
            supply = offered_count.get(skill, 0)
            gap = demand - supply
            
            if gap > 0:  # Only show skills with unmet demand
                skills_gap.append({
                    'skill': skill,
                    'demandCount': demand,
                    'supplyCount': supply,
                    'gap': gap
                })
        
        # Sort by gap (highest first)
        skills_gap.sort(key=lambda x: x['gap'], reverse=True)
        
        return {
            'topOfferedSkills': top_offered,
            'topNeededSkills': top_needed,
            'skillsGap': skills_gap[:10]  # Top 10 gaps
        }
    
    def get_user_summaries(self, all_users: List[Dict]) -> List[Dict]:
        """
        Get summarized user list for admin
        
        Returns list of user summaries with essential info
        """
        
        summaries = []
        for user in all_users:
            summaries.append({
                'uid': user.get('uid'),
                'fullName': user.get('fullName', 'Unknown'),
                'email': user.get('email', ''),
                'phone': user.get('phone', ''),
                'role': user.get('role', 'user'),
                'profileCompleted': user.get('profileCompleted', False),
                'status': user.get('status', {'online': False, 'lastSeen': None}),
                'createdAt': user.get('createdAt', 0)
            })
        
        # Sort by creation date (newest first)
        summaries.sort(key=lambda x: x.get('createdAt', 0), reverse=True)
        
        return summaries
    
    def get_exchange_summaries(self, all_exchanges: List[Dict]) -> List[Dict]:
        """
        Get summarized exchange list for admin monitoring
        
        Returns list of exchanges with status
        """
        
        summaries = []
        for exchange in all_exchanges:
            chat_id = exchange.get('chatId', '')
            users = exchange.get('users', [])
            
            # Get completion status
            completed_1 = exchange.get(f'completed_{users[0]}', False) if len(users) > 0 else False
            completed_2 = exchange.get(f'completed_{users[1]}', False) if len(users) > 1 else False
            
            summaries.append({
                'chatId': chat_id,
                'users': users,
                'userNames': exchange.get('userNames', []),
                'exchangeType': exchange.get('exchangeType', 'two-way'),
                'completed_user1': completed_1,
                'completed_user2': completed_2,
                'fullyCompleted': exchange.get('fullyCompleted', False),
                'completedAt': exchange.get('fullyCompletedAt', None)
            })
        
        # Sort by completion date (most recent first)
        summaries.sort(
            key=lambda x: x.get('completedAt', 0) if x.get('completedAt') else 0,
            reverse=True
        )
        
        return summaries
    
    def process_feedback_list(self, all_feedback: List[Dict], user_lookup: Dict[str, str]) -> List[Dict]:
        """
        Process feedback list for admin view
        
        Args:
            all_feedback: List of feedback objects
            user_lookup: Dictionary mapping UID to full name
            
        Returns:
            List of feedback summaries with user names
        """
        
        summaries = []
        for feedback in all_feedback:
            from_uid = feedback.get('fromUserId', '')
            to_uid = feedback.get('toUserId', '')
            
            summaries.append({
                'feedbackId': feedback.get('feedbackId', ''),
                'fromUser': from_uid,
                'fromUserName': user_lookup.get(from_uid, 'Unknown'),
                'toUser': to_uid,
                'toUserName': user_lookup.get(to_uid, 'Unknown'),
                'rating': feedback.get('rating', 0),
                'comment': feedback.get('comment', ''),
                'timestamp': feedback.get('timestamp', 0)
            })
        
        # Sort by timestamp (newest first)
        summaries.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
        
        return summaries
    
    def process_reports_list(self, all_reports: List[Dict], user_lookup: Dict[str, str]) -> List[Dict]:
        """
        Process reports list for admin view
        
        Args:
            all_reports: List of report objects
            user_lookup: Dictionary mapping UID to full name
            
        Returns:
            List of report summaries with user names
        """
        
        summaries = []
        for report in all_reports:
            reported_by = report.get('reportedBy', '')
            reported_user = report.get('reportedUser', '')
            
            summaries.append({
                'reportId': report.get('reportId', ''),
                'reportedBy': reported_by,
                'reportedByName': user_lookup.get(reported_by, 'Unknown'),
                'reportedUser': reported_user,
                'reportedUserName': user_lookup.get(reported_user, 'Unknown'),
                'reason': report.get('reason', ''),
                'description': report.get('description', ''),
                'timestamp': report.get('timestamp', 0),
                'status': report.get('status', 'pending'),
                'resolvedAt': report.get('resolvedAt', None)
            })
        
        # Sort: pending first, then by timestamp
        summaries.sort(
            key=lambda x: (x.get('status') != 'pending', -x.get('timestamp', 0))
        )
        return summaries