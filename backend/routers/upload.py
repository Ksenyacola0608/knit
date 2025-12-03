from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, status
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from pathlib import Path
import uuid
import os
from typing import List
from utils.auth import get_current_user
from database import get_db

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = Path("/app/backend/uploads")
AVATAR_DIR = UPLOAD_DIR / "avatars"
SERVICE_DIR = UPLOAD_DIR / "services"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_image(file: UploadFile):
    # Check file extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    return ext

@router.post("/avatar", response_model=dict)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    ext = validate_image(file)
    
    # Generate unique filename
    filename = f"{uuid.uuid4()}{ext}"
    file_path = AVATAR_DIR / filename
    
    # Save file
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File too large. Max size is 5MB"
            )
        
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Update user avatar in database
    avatar_url = f"/api/upload/avatars/{filename}"
    
    # Delete old avatar if exists
    user = await db.users.find_one({"id": current_user["id"]})
    if user and user.get("avatar"):
        old_filename = user["avatar"].split("/")[-1]
        old_path = AVATAR_DIR / old_filename
        if old_path.exists():
            os.remove(old_path)
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"avatar": avatar_url}}
    )
    
    return {"avatar_url": avatar_url, "message": "Avatar uploaded successfully"}

@router.post("/service/{service_id}", response_model=dict)
async def upload_service_images(
    service_id: str,
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Check service ownership
    service = await db.services.find_one({"id": service_id})
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    
    if service["master_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to upload images for this service"
        )
    
    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 images allowed"
        )
    
    uploaded_urls = []
    
    for file in files:
        ext = validate_image(file)
        
        # Generate unique filename
        filename = f"{uuid.uuid4()}{ext}"
        file_path = SERVICE_DIR / filename
        
        # Save file
        try:
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File {file.filename} is too large. Max size is 5MB"
                )
            
            with open(file_path, "wb") as f:
                f.write(content)
            
            image_url = f"/api/upload/services/{filename}"
            uploaded_urls.append(image_url)
        except Exception as e:
            # Clean up already uploaded files on error
            for url in uploaded_urls:
                filename = url.split("/")[-1]
                path = SERVICE_DIR / filename
                if path.exists():
                    os.remove(path)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save file: {str(e)}"
            )
    
    # Update service images in database
    current_images = service.get("images", [])
    updated_images = current_images + uploaded_urls
    
    await db.services.update_one(
        {"id": service_id},
        {"$set": {"images": updated_images}}
    )
    
    return {"image_urls": uploaded_urls, "message": f"{len(uploaded_urls)} images uploaded successfully"}

@router.delete("/service/{service_id}/image", response_model=dict)
async def delete_service_image(
    service_id: str,
    image_url: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Check service ownership
    service = await db.services.find_one({"id": service_id})
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    
    if service["master_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete images for this service"
        )
    
    # Remove image from database
    current_images = service.get("images", [])
    if image_url not in current_images:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    
    updated_images = [img for img in current_images if img != image_url]
    
    await db.services.update_one(
        {"id": service_id},
        {"$set": {"images": updated_images}}
    )
    
    # Delete physical file
    filename = image_url.split("/")[-1]
    file_path = SERVICE_DIR / filename
    if file_path.exists():
        os.remove(file_path)
    
    return {"message": "Image deleted successfully"}

@router.get("/avatars/{filename}")
async def get_avatar(filename: str):
    file_path = AVATAR_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return FileResponse(file_path)

@router.get("/services/{filename}")
async def get_service_image(filename: str):
    file_path = SERVICE_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return FileResponse(file_path)
