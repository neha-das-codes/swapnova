# backend/app/models/user.py

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime

class Location(BaseModel):
    city: str
    area: str

class Availability(BaseModel):
    days: List[str]  # ["Weekdays", "Weekends", "All Days"]
    time: List[str]  # ["Morning", "Afternoon", "Evening"]

class SocialLinks(BaseModel):
    dropbox: Optional[str] = ""
    googleDrive: Optional[str] = ""
    linkedin: Optional[str] = ""
    portfolio: Optional[str] = ""

class UserStatus(BaseModel):
    online: bool = False
    lastSeen: int  # Milliseconds timestamp

class UserProfile(BaseModel):
    uid: str
    fullName: str
    email: str
    phone: str
    skillsOffered: List[str]
    skillsNeeded: List[str]
    location: Location
    exchangeMode: str  # "Online", "Offline", or "Both"
    availability: Availability
    bio: Optional[str] = ""
    profileCompleted: bool = False
    role: str = "user"  # "user" or "admin"
    socialLinks: SocialLinks = SocialLinks()
    status: UserStatus
    createdAt: int  # Milliseconds timestamp
    updatedAt: int  # Milliseconds timestamp

class UserCreate(BaseModel):
    fullName: str
    email: str
    phone: str
    skillsOffered: List[str]
    skillsNeeded: List[str]
    location: Location
    exchangeMode: str
    availability: Availability
    bio: Optional[str] = ""
    socialLinks: Optional[SocialLinks] = SocialLinks()
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        # Basic validation - must start with + and be 10-15 digits
        if not v.startswith('+'):
            raise ValueError('Phone must start with country code (+)')
        if len(v) < 11 or len(v) > 16:
            raise ValueError('Phone number must be 10-15 digits')
        return v

class UserUpdate(BaseModel):
    fullName: Optional[str] = None
    skillsOffered: Optional[List[str]] = None
    skillsNeeded: Optional[List[str]] = None
    location: Optional[Location] = None
    exchangeMode: Optional[str] = None
    availability: Optional[Availability] = None
    bio: Optional[str] = None
    socialLinks: Optional[SocialLinks] = None