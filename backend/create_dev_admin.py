import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
from utils.security import hash_password
import os

async def create_developer_admin():
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.handcraft_platform
    
    # Проверим, существует ли уже
    existing = await db.users.find_one({"email": "developer@handycraft.com"})
    
    if existing:
        print("✅ Администратор developer@handycraft.com уже существует")
        client.close()
        return
    
    # Создаем нового админа
    admin = {
        "id": str(uuid.uuid4()),
        "email": "developer@handycraft.com",
        "name": "Developer Admin",
        "role": "admin",
        "password_hash": hash_password("admin"),
        "phone": "+7 (999) 000-00-00",
        "bio": "Администратор разработчика",
        "specializations": [],
        "avatar": None,
        "rating": 5.0,
        "total_reviews": 0,
        "completed_orders": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(admin)
    print("✅ Создан новый администратор:")
    print(f"   Email: developer@handycraft.com")
    print(f"   Пароль: admin")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_developer_admin())
