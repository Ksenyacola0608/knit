import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from utils.security import hash_password
import os

async def update_admin_password():
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.handcraft_platform
    
    # Обновляем пароль
    result = await db.users.update_one(
        {"email": "developer@handycraft.com"},
        {"$set": {
            "password_hash": hash_password("admin"),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.modified_count > 0:
        print("✅ Пароль администратора обновлен")
        print("   Email: developer@handycraft.com")
        print("   Пароль: admin")
    else:
        user = await db.users.find_one({"email": "developer@handycraft.com"})
        if user:
            print("⚠️  Пользователь найден, но пароль не был изменен")
        else:
            print("❌ Пользователь не найден")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(update_admin_password())
