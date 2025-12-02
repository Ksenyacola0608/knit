from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid
from datetime import datetime, timezone

from models import Message, MessageCreate, NotificationCreate, NotificationType
from utils import get_current_user
from database import get_db

router = APIRouter(prefix="/messages", tags=["messages"])

async def create_notification(db: AsyncIOMotorDatabase, notification: NotificationCreate):
    notif_dict = notification.model_dump()
    notif_dict["id"] = str(uuid.uuid4())
    notif_dict["is_read"] = False
    notif_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.notifications.insert_one(notif_dict)

@router.get("/order/{order_id}", response_model=dict)
async def get_order_messages(
    order_id: str,
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Check order access
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    if order["customer_id"] != current_user["id"] and order["master_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    query = {"order_id": order_id}
    total = await db.messages.count_documents(query)
    messages_cursor = db.messages.find(query, {"_id": 0}).sort("created_at", 1).skip(skip).limit(limit)
    messages = await messages_cursor.to_list(length=limit)
    
    # Add sender name
    for msg in messages:
        sender = await db.users.find_one({"id": msg["sender_id"]}, {"_id": 0, "name": 1})
        if sender:
            msg["sender_name"] = sender["name"]
        
        if isinstance(msg.get("created_at"), str):
            msg["created_at"] = datetime.fromisoformat(msg["created_at"])
    
    return {"total": total, "messages": messages}

@router.post("", response_model=Message, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_data: MessageCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Check order
    order = await db.orders.find_one({"id": message_data.order_id})
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    if order["customer_id"] != current_user["id"] and order["master_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    # Determine receiver
    receiver_id = order["master_id"] if current_user["id"] == order["customer_id"] else order["customer_id"]
    
    # Create message
    message_dict = message_data.model_dump()
    message_dict["id"] = str(uuid.uuid4())
    message_dict["sender_id"] = current_user["id"]
    message_dict["receiver_id"] = receiver_id
    message_dict["is_read"] = False
    message_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.messages.insert_one(message_dict)
    
    # Create notification for receiver
    await create_notification(db, NotificationCreate(
        user_id=receiver_id,
        type=NotificationType.NEW_MESSAGE,
        title="Новое сообщение",
        content=f"Новое сообщение в заказе",
        link=f"/chat/{message_data.order_id}"
    ))
    
    message_dict["created_at"] = datetime.fromisoformat(message_dict["created_at"])
    return Message(**message_dict)

@router.patch("/order/{order_id}/read", response_model=dict)
async def mark_messages_as_read(
    order_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Check order access
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    if order["customer_id"] != current_user["id"] and order["master_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    # Mark messages as read
    result = await db.messages.update_many(
        {"order_id": order_id, "receiver_id": current_user["id"], "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return {"marked_as_read": result.modified_count}

@router.get("/chats", response_model=dict)
async def get_chats(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Get all orders where user is involved
    orders = await db.orders.find(
        {"$or": [{"customer_id": current_user["id"]}, {"master_id": current_user["id"]}]},
        {"_id": 0}
    ).to_list(1000)
    
    chats = []
    for order in orders:
        # Get last message
        last_message = await db.messages.find_one(
            {"order_id": order["id"]},
            {"_id": 0},
            sort=[("created_at", -1)]
        )
        
        # Get unread count
        unread_count = await db.messages.count_documents({
            "order_id": order["id"],
            "receiver_id": current_user["id"],
            "is_read": False
        })
        
        # Get service info
        service = await db.services.find_one({"id": order["service_id"]}, {"_id": 0, "title": 1})
        
        # Get other user info
        other_user_id = order["master_id"] if current_user["id"] == order["customer_id"] else order["customer_id"]
        other_user = await db.users.find_one({"id": other_user_id}, {"_id": 0, "id": 1, "name": 1, "avatar": 1})
        
        chat_data = {
            "order_id": order["id"],
            "order_title": service["title"] if service else "Unknown",
            "other_user": other_user,
            "unread_count": unread_count
        }
        
        if last_message:
            if isinstance(last_message.get("created_at"), str):
                last_message["created_at"] = datetime.fromisoformat(last_message["created_at"])
            chat_data["last_message"] = {
                "content": last_message["content"],
                "created_at": last_message["created_at"],
                "is_read": last_message["is_read"]
            }
        
        chats.append(chat_data)
    
    # Sort by last message time
    chats.sort(key=lambda x: x.get("last_message", {}).get("created_at", datetime.min), reverse=True)
    
    return {"chats": chats}
