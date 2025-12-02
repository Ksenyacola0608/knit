from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

from utils import get_current_user
from database import get_db

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("", response_model=dict)
async def get_notifications(
    unread_only: bool = False,
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    query = {"user_id": current_user["id"]}
    if unread_only:
        query["is_read"] = False
    
    total = await db.notifications.count_documents({"user_id": current_user["id"]})
    unread_count = await db.notifications.count_documents({"user_id": current_user["id"], "is_read": False})
    
    notifications_cursor = db.notifications.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
    notifications = await notifications_cursor.to_list(length=limit)
    
    # Convert datetime
    for notif in notifications:
        if isinstance(notif.get("created_at"), str):
            notif["created_at"] = datetime.fromisoformat(notif["created_at"])
    
    return {
        "total": total,
        "unread_count": unread_count,
        "notifications": notifications
    }

@router.patch("/{notification_id}/read", response_model=dict)
async def mark_notification_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    notif = await db.notifications.find_one({"id": notification_id})
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    
    if notif["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    await db.notifications.update_one({"id": notification_id}, {"$set": {"is_read": True}})
    
    return {"id": notification_id, "is_read": True}

@router.patch("/read-all", response_model=dict)
async def mark_all_as_read(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    result = await db.notifications.update_many(
        {"user_id": current_user["id"], "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return {"marked_as_read": result.modified_count}
