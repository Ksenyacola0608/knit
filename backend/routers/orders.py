from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional
import uuid
from datetime import datetime, timezone

from models import Order, OrderCreate, OrderUpdateStatus, OrderStatus, NotificationCreate, NotificationType
from utils import get_current_user
from database import get_db

router = APIRouter(prefix="/orders", tags=["orders"])

async def create_notification(db: AsyncIOMotorDatabase, notification: NotificationCreate):
    notif_dict = notification.model_dump()
    notif_dict["id"] = str(uuid.uuid4())
    notif_dict["is_read"] = False
    notif_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.notifications.insert_one(notif_dict)

@router.post("", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Get service
    service = await db.services.find_one({"id": order_data.service_id})
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    
    if not service.get("is_active", False):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Service is not active")
    
    # Create order
    order_dict = order_data.model_dump()
    order_dict["id"] = str(uuid.uuid4())
    order_dict["customer_id"] = current_user["id"]
    order_dict["master_id"] = service["master_id"]
    order_dict["status"] = OrderStatus.PENDING.value
    order_dict["agreed_price"] = None
    order_dict["deadline"] = None
    order_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    order_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    order_dict["completed_at"] = None
    
    await db.orders.insert_one(order_dict)
    
    # Increment service orders count
    await db.services.update_one({"id": order_data.service_id}, {"$inc": {"orders_count": 1}})
    
    # Create notification for master
    await create_notification(db, NotificationCreate(
        user_id=service["master_id"],
        type=NotificationType.NEW_ORDER,
        title="Новый заказ",
        content=f"У вас новый заказ на услугу '{service['title']}'",
        link=f"/orders/{order_dict['id']}"
    ))
    
    # Convert datetime
    order_dict["created_at"] = datetime.fromisoformat(order_dict["created_at"])
    order_dict["updated_at"] = datetime.fromisoformat(order_dict["updated_at"])
    
    return Order(**order_dict)

@router.get("", response_model=dict)
async def get_orders(
    status_filter: Optional[str] = None,
    role: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Build query based on role
    if role == "customer":
        query = {"customer_id": current_user["id"]}
    elif role == "master":
        query = {"master_id": current_user["id"]}
    else:
        # Show both
        query = {"$or": [{"customer_id": current_user["id"]}, {"master_id": current_user["id"]}]}
    
    if status_filter:
        query["status"] = status_filter
    
    total = await db.orders.count_documents(query)
    orders_cursor = db.orders.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
    orders = await orders_cursor.to_list(length=limit)
    
    # Enrich with service, customer, master info
    for order in orders:
        service = await db.services.find_one({"id": order["service_id"]}, {"_id": 0, "id": 1, "title": 1, "price": 1, "images": 1})
        if service:
            order["service"] = service
        
        customer = await db.users.find_one({"id": order["customer_id"]}, {"_id": 0, "id": 1, "name": 1, "avatar": 1})
        if customer:
            order["customer"] = customer
        
        master = await db.users.find_one({"id": order["master_id"]}, {"_id": 0, "id": 1, "name": 1, "avatar": 1, "rating": 1})
        if master:
            order["master"] = master
        
        # Convert datetime
        if isinstance(order.get("created_at"), str):
            order["created_at"] = datetime.fromisoformat(order["created_at"])
        if isinstance(order.get("updated_at"), str):
            order["updated_at"] = datetime.fromisoformat(order["updated_at"])
        if order.get("deadline") and isinstance(order["deadline"], str):
            order["deadline"] = datetime.fromisoformat(order["deadline"])
        if order.get("completed_at") and isinstance(order["completed_at"], str):
            order["completed_at"] = datetime.fromisoformat(order["completed_at"])
    
    return {"total": total, "skip": skip, "limit": limit, "orders": orders}

@router.get("/{order_id}", response_model=dict)
async def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    order_doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    # Check access
    if order_doc["customer_id"] != current_user["id"] and order_doc["master_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    # Enrich data
    service = await db.services.find_one({"id": order_doc["service_id"]}, {"_id": 0})
    if service:
        if isinstance(service.get("created_at"), str):
            service["created_at"] = datetime.fromisoformat(service["created_at"])
        if isinstance(service.get("updated_at"), str):
            service["updated_at"] = datetime.fromisoformat(service["updated_at"])
        order_doc["service"] = service
    
    customer = await db.users.find_one({"id": order_doc["customer_id"]}, {"_id": 0, "password_hash": 0})
    if customer:
        if isinstance(customer.get("created_at"), str):
            customer["created_at"] = datetime.fromisoformat(customer["created_at"])
        order_doc["customer"] = customer
    
    master = await db.users.find_one({"id": order_doc["master_id"]}, {"_id": 0, "password_hash": 0})
    if master:
        if isinstance(master.get("created_at"), str):
            master["created_at"] = datetime.fromisoformat(master["created_at"])
        order_doc["master"] = master
    
    # Convert datetime
    if isinstance(order_doc.get("created_at"), str):
        order_doc["created_at"] = datetime.fromisoformat(order_doc["created_at"])
    if isinstance(order_doc.get("updated_at"), str):
        order_doc["updated_at"] = datetime.fromisoformat(order_doc["updated_at"])
    if order_doc.get("deadline") and isinstance(order_doc["deadline"], str):
        order_doc["deadline"] = datetime.fromisoformat(order_doc["deadline"])
    if order_doc.get("completed_at") and isinstance(order_doc["completed_at"], str):
        order_doc["completed_at"] = datetime.fromisoformat(order_doc["completed_at"])
    
    return order_doc

@router.patch("/{order_id}/status", response_model=dict)
async def update_order_status(
    order_id: str,
    status_data: OrderUpdateStatus,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    order_doc = await db.orders.find_one({"id": order_id})
    if not order_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    # Only master can update status
    if order_doc["master_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only master can update order status")
    
    update_dict = status_data.model_dump(exclude_unset=True)
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    if status_data.status == OrderStatus.COMPLETED:
        update_dict["completed_at"] = datetime.now(timezone.utc).isoformat()
        # Increment master's completed orders
        await db.users.update_one({"id": order_doc["master_id"]}, {"$inc": {"completed_orders": 1}})
    
    # Convert deadline to ISO string if present
    if "deadline" in update_dict and update_dict["deadline"]:
        update_dict["deadline"] = update_dict["deadline"].isoformat()
    
    await db.orders.update_one({"id": order_id}, {"$set": update_dict})
    
    # Create notification for customer
    service = await db.services.find_one({"id": order_doc["service_id"]})
    notification_types = {
        OrderStatus.ACCEPTED: NotificationType.ORDER_ACCEPTED,
        OrderStatus.REJECTED: NotificationType.ORDER_REJECTED,
        OrderStatus.COMPLETED: NotificationType.ORDER_COMPLETED
    }
    
    if status_data.status in notification_types:
        await create_notification(db, NotificationCreate(
            user_id=order_doc["customer_id"],
            type=notification_types[status_data.status],
            title=f"Заказ {status_data.status.value}",
            content=f"Статус вашего заказа '{service['title']}' изменен на {status_data.status.value}",
            link=f"/orders/{order_id}"
        ))
    
    # Get updated order
    return await get_order(order_id, current_user, db)
