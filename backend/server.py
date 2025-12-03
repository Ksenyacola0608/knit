from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

# Import database
from database import client, db, get_db

# Import routers
from routers import (
    auth_router,
    users_router,
    services_router,
    orders_router,
    reviews_router,
    messages_router,
    notifications_router
)
from routers.upload import router as upload_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI(title="Handcraft Platform API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Handcraft Platform API", "status": "running"}

@api_router.get("/health")
async def health_check():
    try:
        await db.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(services_router)
api_router.include_router(orders_router)
api_router.include_router(reviews_router)
api_router.include_router(messages_router)
api_router.include_router(notifications_router)
api_router.include_router(upload_router)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()