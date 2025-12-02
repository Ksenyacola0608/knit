from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum

class UserRole(str, Enum):
    CUSTOMER = "customer"
    MASTER = "master"

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    role: UserRole
    phone: Optional[str] = None
    bio: Optional[str] = None
    specializations: Optional[List[str]] = []

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = None
    bio: Optional[str] = None
    specializations: Optional[List[str]] = None
    avatar: Optional[str] = None

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    avatar: Optional[str] = None
    rating: float = 0.0
    total_reviews: int = 0
    completed_orders: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    specializations: Optional[List[str]] = []
    rating: float = 0.0
    total_reviews: int = 0
    completed_orders: int = 0
    created_at: datetime
