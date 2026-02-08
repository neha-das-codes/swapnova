from pydantic import BaseModel
from typing import List, Optional

class DashboardStats(BaseModel):
    """Statistics for admin dashboard"""
    totalUsers: int
    activeUsers: int  # Users online now
    totalExchanges: int
    completedExchanges: int
    successRate: float  # Percentage
    newUsersThisWeek: int
    newUsersThisMonth: int

class SkillCount(BaseModel):
    """Skill with count"""
    skill: str
    count: int

class SkillGap(BaseModel):
    """Skill demand-supply gap"""
    skill: str
    demandCount: int
    supplyCount: int
    gap: int

class SkillsAnalytics(BaseModel):
    """Skills analytics for admin"""
    topOfferedSkills: List[SkillCount]
    topNeededSkills: List[SkillCount]
    skillsGap: List[SkillGap]

class UserSummary(BaseModel):
    """User summary for admin list"""
    uid: str
    fullName: str
    email: str
    phone: Optional[str] = None
    role: str
    profileCompleted: bool
    status: dict  # {online: bool, lastSeen: timestamp}
    createdAt: int

class ExchangeSummary(BaseModel):
    """Exchange summary for admin monitoring"""
    chatId: str
    users: List[str]  # UIDs
    userNames: List[str]
    exchangeType: str  # "two-way" or "one-way"
    completed_user1: bool
    completed_user2: bool
    fullyCompleted: bool
    completedAt: Optional[int] = None

class Report(BaseModel):
    """User report for admin"""
    reportId: str
    reportedBy: str  # UID
    reportedByName: str
    reportedUser: str  # UID
    reportedUserName: str
    reason: str
    description: str
    timestamp: int
    status: str  # "pending" or "resolved"
    resolvedAt: Optional[int] = None

class FeedbackSummary(BaseModel):
    """Feedback summary for admin"""
    feedbackId: str
    fromUser: str  # UID
    fromUserName: str
    toUser: str  # UID
    toUserName: str
    rating: int  # 1-5
    comment: str
    timestamp: int
