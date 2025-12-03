import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os

async def fix_admin_role():
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.handcraft_platform
    
    # Обновляем роль на admin
    result = await db.users.update_one(
        {"email": "developer@handycraft.com"},
        {"$set": {
            "role": "admin",
            "name": "Developer Admin",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.modified_count > 0:
        print("✅ Роль обновлена на ADMIN")
        print("   Email: developer@handycraft.com")
        print("   Пароль: admin")
        print("   Роль: admin")
    else:
        print("⚠️  Изменений не было")
    
    # Проверим
    user = await db.users.find_one({"email": "developer@handycraft.com"}, {"_id": 0, "email": 1, "name": 1, "role": 1})
    if user:
        print(f"\n✅ Текущие данные:")
        print(f"   Email: {user['email']}")
        print(f"   Имя: {user['name']}")
        print(f"   Роль: {user['role']}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_admin_role())
