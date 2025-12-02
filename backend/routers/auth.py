from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
import uuid
from datetime import datetime, timezone

from models import User, UserCreate, UserRole
from utils import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    token: str
    user: User

# Dependency to get database
from database import get_db

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Create user
    user_dict = user_data.model_dump(exclude={"password"})
    user_dict["id"] = str(uuid.uuid4())
    user_dict["password_hash"] = hash_password(user_data.password)
    user_dict["rating"] = 0.0
    user_dict["total_reviews"] = 0
    user_dict["completed_orders"] = 0
    user_dict["avatar"] = None
    user_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    user_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create token
    token = create_access_token({
        "sub": user_dict["id"],
        "email": user_dict["email"],
        "role": user_dict["role"]
    })
    
    # Convert datetime strings back for response
    user_dict["created_at"] = datetime.fromisoformat(user_dict["created_at"])
    user_dict["updated_at"] = datetime.fromisoformat(user_dict["updated_at"])
    
    user = User(**{k: v for k, v in user_dict.items() if k != "password_hash"})
    
    return AuthResponse(token=token, user=user)

@router.post("/login", response_model=AuthResponse)
async def login(login_data: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    # Find user
    user_doc = await db.users.find_one({"email": login_data.email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not verify_password(login_data.password, user_doc["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create token
    token = create_access_token({
        "sub": user_doc["id"],
        "email": user_doc["email"],
        "role": user_doc["role"]
    })
    
    # Convert datetime strings
    if isinstance(user_doc["created_at"], str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    if isinstance(user_doc["updated_at"], str):
        user_doc["updated_at"] = datetime.fromisoformat(user_doc["updated_at"])
    
    user = User(**{k: v for k, v in user_doc.items() if k not in ["_id", "password_hash"]})
    
    return AuthResponse(token=token, user=user)
