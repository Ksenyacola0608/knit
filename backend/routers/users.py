from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone

from models import User, UserUpdate, UserPublic
from utils import get_current_user
from database import get_db

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=User)
async def get_current_user_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    user_doc = await db.users.find_one({"id": current_user["id"]}, {"_id": 0, "password_hash": 0})
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Convert datetime strings
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    if isinstance(user_doc.get("updated_at"), str):
        user_doc["updated_at"] = datetime.fromisoformat(user_doc["updated_at"])
    
    return User(**user_doc)

@router.put("/me", response_model=User)
async def update_current_user_profile(
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    update_dict = user_data.model_dump(exclude_unset=True)
    if not update_dict:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No data to update")
    
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": update_dict}
    )
    
    user_doc = await db.users.find_one({"id": current_user["id"]}, {"_id": 0, "password_hash": 0})
    
    # Convert datetime strings
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    if isinstance(user_doc.get("updated_at"), str):
        user_doc["updated_at"] = datetime.fromisoformat(user_doc["updated_at"])
    
    return User(**user_doc)

@router.get("/{user_id}", response_model=UserPublic)
async def get_user_profile(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Публичный профиль - скрываем email и phone
    user_doc = await db.users.find_one(
        {"id": user_id},
        {"_id": 0, "password_hash": 0, "email": 0, "phone": 0, "updated_at": 0}
    )
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Convert datetime strings
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    
    return UserPublic(**user_doc)
