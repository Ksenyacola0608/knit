from fastapi import APIRouter, HTTPException, status, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List
import uuid
from datetime import datetime, timezone

from models import Service, ServiceCreate, ServiceUpdate, UserRole
from utils import get_current_user
from server import get_db

router = APIRouter(prefix="/services", tags=["services"])

@router.get("", response_model=dict)
async def get_services(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = "created_at",
    skip: int = 0,
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Build query
    query = {"is_active": True}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    
    # Sort
    sort_field = sort_by if sort_by in ["price", "created_at", "rating"] else "created_at"
    sort_direction = -1 if sort_field in ["created_at", "rating"] else 1
    
    total = await db.services.count_documents(query)
    services_cursor = db.services.find(query, {"_id": 0}).sort(sort_field, sort_direction).skip(skip).limit(limit)
    services = await services_cursor.to_list(length=limit)
    
    # Get master info for each service
    for service in services:
        master = await db.users.find_one({"id": service["master_id"]}, {"_id": 0, "name": 1, "rating": 1, "id": 1})
        if master:
            service["master_name"] = master.get("name")
            service["master_rating"] = master.get("rating", 0)
        
        # Convert datetime
        if isinstance(service.get("created_at"), str):
            service["created_at"] = datetime.fromisoformat(service["created_at"])
        if isinstance(service.get("updated_at"), str):
            service["updated_at"] = datetime.fromisoformat(service["updated_at"])
    
    return {"total": total, "skip": skip, "limit": limit, "services": services}

@router.get("/{service_id}", response_model=dict)
async def get_service(
    service_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service_doc = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    
    # Increment views
    await db.services.update_one({"id": service_id}, {"$inc": {"views": 1}})
    service_doc["views"] = service_doc.get("views", 0) + 1
    
    # Get master info
    master = await db.users.find_one(
        {"id": service_doc["master_id"]},
        {"_id": 0, "password_hash": 0, "email": 0, "phone": 0}
    )
    if master:
        if isinstance(master.get("created_at"), str):
            master["created_at"] = datetime.fromisoformat(master["created_at"])
        service_doc["master"] = master
    
    # Convert datetime
    if isinstance(service_doc.get("created_at"), str):
        service_doc["created_at"] = datetime.fromisoformat(service_doc["created_at"])
    if isinstance(service_doc.get("updated_at"), str):
        service_doc["updated_at"] = datetime.fromisoformat(service_doc["updated_at"])
    
    return service_doc

@router.post("", response_model=Service, status_code=status.HTTP_201_CREATED)
async def create_service(
    service_data: ServiceCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Check if user is master
    if current_user["role"] != UserRole.MASTER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only masters can create services"
        )
    
    service_dict = service_data.model_dump()
    service_dict["id"] = str(uuid.uuid4())
    service_dict["master_id"] = current_user["id"]
    service_dict["is_active"] = True
    service_dict["views"] = 0
    service_dict["orders_count"] = 0
    service_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    service_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.services.insert_one(service_dict)
    
    # Convert datetime for response
    service_dict["created_at"] = datetime.fromisoformat(service_dict["created_at"])
    service_dict["updated_at"] = datetime.fromisoformat(service_dict["updated_at"])
    
    return Service(**service_dict)

@router.put("/{service_id}", response_model=Service)
async def update_service(
    service_id: str,
    service_data: ServiceUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Check if service exists and belongs to user
    service_doc = await db.services.find_one({"id": service_id})
    if not service_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    
    if service_doc["master_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this service"
        )
    
    update_dict = service_data.model_dump(exclude_unset=True)
    if not update_dict:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No data to update")
    
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.services.update_one({"id": service_id}, {"$set": update_dict})
    
    updated_doc = await db.services.find_one({"id": service_id}, {"_id": 0})
    
    # Convert datetime
    if isinstance(updated_doc.get("created_at"), str):
        updated_doc["created_at"] = datetime.fromisoformat(updated_doc["created_at"])
    if isinstance(updated_doc.get("updated_at"), str):
        updated_doc["updated_at"] = datetime.fromisoformat(updated_doc["updated_at"])
    
    return Service(**updated_doc)

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service_doc = await db.services.find_one({"id": service_id})
    if not service_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    
    if service_doc["master_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this service"
        )
    
    await db.services.delete_one({"id": service_id})
    return None

@router.get("/master/{master_id}", response_model=dict)
async def get_master_services(
    master_id: str,
    skip: int = 0,
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    query = {"master_id": master_id, "is_active": True}
    
    total = await db.services.count_documents(query)
    services_cursor = db.services.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
    services = await services_cursor.to_list(length=limit)
    
    for service in services:
        if isinstance(service.get("created_at"), str):
            service["created_at"] = datetime.fromisoformat(service["created_at"])
        if isinstance(service.get("updated_at"), str):
            service["updated_at"] = datetime.fromisoformat(service["updated_at"])
    
    return {"total": total, "skip": skip, "limit": limit, "services": services}
