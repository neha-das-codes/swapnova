from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional
from firebase_admin import db
from ..services.admin_service import AdminService
from ..middleware.auth import verify_admin
import time
# Create router
router = APIRouter(
    prefix="/api/admin",
    tags=["Admin Dashboard"]
)
# Initialize admin service
admin_service = AdminService()
@router.get("/stats")
async def get_dashboard_stats(admin_uid: str = Query(..., description="Admin user UID")):
    """
    Get main dashboard statistics
    
    Requires admin authentication
    
    Returns:
        - Total users count
        - Active users (online)
        - Total exchanges
        - Completed exchanges
        - Success rate
        - New users this week/month
    """
    try:
        # Verify admin
        verify_admin(admin_uid)
        
        # Get all users
        users_ref = db.reference('users')
        users_data = users_ref.get()
        all_users = []
        if users_data:
            for uid, user in users_data.items():
                user['uid'] = uid
                all_users.append(user)
        
        # Get all exchanges
        exchanges_ref = db.reference('exchanges')
        exchanges_data = exchanges_ref.get()
        all_exchanges = []
        if exchanges_data:
            for chat_id, exchange in exchanges_data.items():
                exchange['chatId'] = chat_id
                all_exchanges.append(exchange)
        
        # Calculate stats
        stats = admin_service.calculate_dashboard_stats(all_users, all_exchanges)
        
        print(f"✅ Admin {admin_uid} accessed dashboard stats")
        
        return stats
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting dashboard stats: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting stats: {str(e)}"
        )
@router.get("/skills-analytics")
async def get_skills_analytics(admin_uid: str = Query(..., description="Admin user UID")):
    """
    Get skills demand/supply analytics
    
    Returns:
        - Top offered skills
        - Top needed skills
        - Skills gap (high demand, low supply)
    """
    try:
        # Verify admin
        verify_admin(admin_uid)
        
        # Get all users
        users_ref = db.reference('users')
        users_data = users_ref.get()
        all_users = []
        if users_data:
            for uid, user in users_data.items():
                user['uid'] = uid
                all_users.append(user)
        
        # Calculate analytics
        analytics = admin_service.calculate_skills_analytics(all_users)
        
        print(f"✅ Admin {admin_uid} accessed skills analytics")
        
        return analytics
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting skills analytics: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting analytics: {str(e)}"
        )
@router.get("/users")
async def get_all_users_admin(
    admin_uid: str = Query(..., description="Admin user UID"),
    search: Optional[str] = Query(None, description="Search by name or email")
):
    """
    Get all users with admin view
    
    Optional search parameter to filter by name/email
    """
    try:
        # Verify admin
        verify_admin(admin_uid)
        
        # Get all users
        users_ref = db.reference('users')
        users_data = users_ref.get()
        all_users = []
        if users_data:
            for uid, user in users_data.items():
                user['uid'] = uid
                all_users.append(user)
        
        # Get user summaries
        user_summaries = admin_service.get_user_summaries(all_users)
        
        # Apply search filter if provided
        if search:
            search_lower = search.lower()
            user_summaries = [
                u for u in user_summaries
                if search_lower in u.get('fullName', '').lower()
                or search_lower in u.get('email', '').lower()
            ]
        
        print(f"✅ Admin {admin_uid} accessed user list (found {len(user_summaries)} users)")
        
        return {
            'users': user_summaries,
            'total': len(user_summaries)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting users: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting users: {str(e)}"
        )
@router.get("/users/{uid}")
async def get_user_details_admin(
    uid: str,
    admin_uid: str = Query(..., description="Admin user UID")
):
    """
    Get detailed information about a specific user
    """
    try:
        # Verify admin
        verify_admin(admin_uid)
        
        # Get user
        user_ref = db.reference(f'users/{uid}')
        user = user_ref.get()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User {uid} not found"
            )
        
        user['uid'] = uid
        
        print(f"✅ Admin {admin_uid} viewed user {uid} details")
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting user details: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting user details: {str(e)}"
        )
@router.get("/exchanges")
async def get_all_exchanges(
    admin_uid: str = Query(..., description="Admin user UID"),
    status_filter: Optional[str] = Query(None, description="Filter: 'completed' or 'in-progress'")
):
    """
    Get all skill exchanges for monitoring
    
    Optional status filter
    """
    try:
        # Verify admin
        verify_admin(admin_uid)
        
        # Get all exchanges
        exchanges_ref = db.reference('exchanges')
        exchanges_data = exchanges_ref.get()
        all_exchanges = []
        if exchanges_data:
            for chat_id, exchange in exchanges_data.items():
                exchange['chatId'] = chat_id
                all_exchanges.append(exchange)
        
        # Get exchange summaries
        exchange_summaries = admin_service.get_exchange_summaries(all_exchanges)
        
        # Apply status filter if provided
        if status_filter:
            if status_filter.lower() == 'completed':
                exchange_summaries = [e for e in exchange_summaries if e.get('fullyCompleted')]
            elif status_filter.lower() == 'in-progress':
                exchange_summaries = [e for e in exchange_summaries if not e.get('fullyCompleted')]
        
        print(f"✅ Admin {admin_uid} accessed exchanges (found {len(exchange_summaries)})")
        
        return {
            'exchanges': exchange_summaries,
            'total': len(exchange_summaries)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting exchanges: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting exchanges: {str(e)}"
        )
@router.get("/feedback")
async def get_all_feedback(admin_uid: str = Query(..., description="Admin user UID")):
    """
    Get all user feedback for monitoring
    """
    try:
        # Verify admin
        verify_admin(admin_uid)
        
        # Get all feedback
        feedback_ref = db.reference('feedback')
        feedback_data = feedback_ref.get()
        all_feedback = []
        if feedback_data:
            for feedback_id, feedback in feedback_data.items():
                feedback['feedbackId'] = feedback_id
                all_feedback.append(feedback)
        
        # Get all users for name lookup
        users_ref = db.reference('users')
        users_data = users_ref.get()
        user_lookup = {}
        if users_data:
            for uid, user in users_data.items():
                user_lookup[uid] = user.get('fullName', 'Unknown')
        
        # Process feedback
        feedback_summaries = admin_service.process_feedback_list(all_feedback, user_lookup)
        
        print(f"✅ Admin {admin_uid} accessed feedback (found {len(feedback_summaries)})")
        
        return {
            'feedback': feedback_summaries,
            'total': len(feedback_summaries)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting feedback: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting feedback: {str(e)}"
        )
@router.get("/reports")
async def get_all_reports(
    admin_uid: str = Query(..., description="Admin user UID"),
    status_filter: Optional[str] = Query(None, description="Filter: 'pending' or 'resolved'")
):
    """
    Get all user reports for handling
    
    Optional status filter
    """
    try:
        # Verify admin
        verify_admin(admin_uid)
        
        # Get all reports
        reports_ref = db.reference('reports')
        reports_data = reports_ref.get()
        all_reports = []
        if reports_data:
            for report_id, report in reports_data.items():
                report['reportId'] = report_id
                all_reports.append(report)
        
        # Get all users for name lookup
        users_ref = db.reference('users')
        users_data = users_ref.get()
        user_lookup = {}
        if users_data:
            for uid, user in users_data.items():
                user_lookup[uid] = user.get('fullName', 'Unknown')
        
        # Process reports
        report_summaries = admin_service.process_reports_list(all_reports, user_lookup)
        
        # Apply status filter
        if status_filter:
            report_summaries = [
                r for r in report_summaries
                if r.get('status', '').lower() == status_filter.lower()
            ]
        
        print(f"✅ Admin {admin_uid} accessed reports (found {len(report_summaries)})")
        
        return {
            'reports': report_summaries,
            'total': len(report_summaries),
            'pendingCount': sum(1 for r in report_summaries if r.get('status') == 'pending')
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting reports: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting reports: {str(e)}"
        )
@router.patch("/reports/{report_id}/resolve")
async def resolve_report(
    report_id: str,
    admin_uid: str = Query(..., description="Admin user UID")
):
    """
    Mark a report as resolved
    """
    try:
        # Verify admin
        verify_admin(admin_uid)
        
        # Get report
        report_ref = db.reference(f'reports/{report_id}')
        report = report_ref.get()
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Report {report_id} not found"
            )
        
        # Update status
        report_ref.update({
            'status': 'resolved',
            'resolvedAt': int(time.time() * 1000)
        })
        
        print(f"✅ Admin {admin_uid} resolved report {report_id}")
        
        return {
            'message': 'Report marked as resolved',
            'reportId': report_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error resolving report: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error resolving report: {str(e)}"
        )