from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid
from datetime import datetime, timezone

from models import Review, ReviewCreate, ReviewDispute, OrderStatus, NotificationCreate, NotificationType
from utils import get_current_user
from database import get_db

router = APIRouter(prefix="/reviews", tags=["reviews"])

async def create_notification(db: AsyncIOMotorDatabase, notification: NotificationCreate):
    notif_dict = notification.model_dump()
    notif_dict["id"] = str(uuid.uuid4())
    notif_dict["is_read"] = False
    notif_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.notifications.insert_one(notif_dict)

async def update_master_rating(db: AsyncIOMotorDatabase, master_id: str):
    # Calculate average rating
    pipeline = [
        {"$match": {"master_id": master_id}},
        {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}}
    ]
    result = await db.reviews.aggregate(pipeline).to_list(1)
    
    if result:
        avg_rating = round(result[0]["avg_rating"], 2)
        total_reviews = result[0]["count"]
        await db.users.update_one(
            {"id": master_id},
            {"$set": {"rating": avg_rating, "total_reviews": total_reviews}}
        )

@router.post("", response_model=Review, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Get order
    order = await db.orders.find_one({"id": review_data.order_id})
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    # Check if order is completed
    if order["status"] != OrderStatus.COMPLETED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only review completed orders"
        )
    
    # Check if user is customer
    if order["customer_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customer can leave review"
        )
    
    # Check if review already exists
    existing_review = await db.reviews.find_one({"order_id": review_data.order_id})
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Review already exists for this order"
        )
    
    # Create review
    review_dict = review_data.model_dump()
    review_dict["id"] = str(uuid.uuid4())
    review_dict["master_id"] = order["master_id"]
    review_dict["customer_id"] = current_user["id"]
    review_dict["service_id"] = order["service_id"]
    review_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.reviews.insert_one(review_dict)
    
    # Update master rating
    await update_master_rating(db, order["master_id"])
    
    # Create notification for master
    await create_notification(db, NotificationCreate(
        user_id=order["master_id"],
        type=NotificationType.NEW_REVIEW,
        title="Новый отзыв",
        content=f"Вы получили новый отзыв с оценкой {review_data.rating} звезд",
        link=f"/orders/{review_data.order_id}"
    ))
    
    review_dict["created_at"] = datetime.fromisoformat(review_dict["created_at"])
    return Review(**review_dict)

@router.get("/master/{master_id}")
async def get_master_reviews(
    master_id: str,
    skip: int = 0,
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Get reviews with customer info
    reviews = await db.reviews.find(
        {"master_id": master_id},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with customer info
    for review in reviews:
        customer = await db.users.find_one(
            {"id": review["customer_id"]},
            {"_id": 0, "name": 1, "avatar": 1}
        )
        if customer:
            review["customer_name"] = customer["name"]
            review["customer_avatar"] = customer.get("avatar")
        
        # Convert datetime if needed
        if isinstance(review.get("created_at"), str):
            review["created_at"] = datetime.fromisoformat(review["created_at"]).isoformat()
    
    total = await db.reviews.count_documents({"master_id": master_id})
    
    return {"reviews": reviews, "total": total, "skip": skip, "limit": limit}

@router.get("/order/{order_id}", response_model=dict)
async def get_order_review(
    order_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    review = await db.reviews.find_one({"order_id": order_id}, {"_id": 0})
    return {"review": review}

@router.get("/service/{service_id}", response_model=dict)
async def get_service_reviews(
    service_id: str,
    skip: int = 0,
    limit: int = 20,
    sort: str = "newest",
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Sort
    if sort == "highest":
        sort_field, sort_direction = "rating", -1
    elif sort == "lowest":
        sort_field, sort_direction = "rating", 1
    else:  # newest
        sort_field, sort_direction = "created_at", -1
    
    query = {"service_id": service_id}
    total = await db.reviews.count_documents(query)
    reviews_cursor = db.reviews.find(query, {"_id": 0}).sort(sort_field, sort_direction).skip(skip).limit(limit)
    reviews = await reviews_cursor.to_list(length=limit)
    
    # Enrich with customer info
    for review in reviews:
        customer = await db.users.find_one({"id": review["customer_id"]}, {"_id": 0, "id": 1, "name": 1, "avatar": 1})
        if customer:
            review["customer"] = customer
        
        if isinstance(review.get("created_at"), str):
            review["created_at"] = datetime.fromisoformat(review["created_at"])
    
    return {"total": total, "skip": skip, "limit": limit, "reviews": reviews}


@router.post("/{review_id}/dispute", response_model=dict)
async def dispute_review(
    review_id: str,
    dispute_data: ReviewDispute,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Get review
    review = await db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    # Check if user is the master
    if review["master_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the master can dispute this review"
        )
    
    # Check if already disputed
    if review.get("is_disputed"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review already disputed"
        )
    
    # Mark as disputed
    await db.reviews.update_one(
        {"id": review_id},
        {"$set": {
            "is_disputed": True,
            "dispute_reason": dispute_data.reason
        }}
    )
    
    # Create notification for admins and customer
    await create_notification(db, NotificationCreate(
        user_id=review["customer_id"],
        type=NotificationType.REVIEW_DISPUTED,
        title="Отзыв оспорен",
        content="Мастер оспорил ваш отзыв. Администрация рассмотрит обращение.",
        link=f"/orders/{review['order_id']}"
    ))
    
    return {"message": "Review disputed successfully"}
