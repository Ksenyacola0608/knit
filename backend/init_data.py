"""
Скрипт инициализации данных: создание админа и тестовых данных
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
from utils.security import hash_password
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')

async def init_database():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.handcraft_platform
    
    print("🚀 Начинаем инициализацию базы данных...")
    
    # 1. Создаем админа
    admin_email = "admin@platform.ru"
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if not existing_admin:
        admin = {
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Администратор",
            "role": "admin",
            "password_hash": hash_password("admin123"),
            "phone": "+7 (999) 999-99-99",
            "bio": "Главный администратор платформы",
            "specializations": [],
            "avatar": None,
            "rating": 5.0,
            "total_reviews": 0,
            "completed_orders": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin)
        print(f"✅ Админ создан: {admin_email} / admin123")
    else:
        print(f"ℹ️  Админ уже существует: {admin_email}")
    
    # 2. Создаем тестовых мастеров
    masters_data = [
        {
            "email": "anna.knit@example.ru",
            "name": "Анна Вязальщикова",
            "password": "master123",
            "role": "master",
            "bio": "Вяжу уютные вещи уже 10 лет. Специализируюсь на детской одежде и аксессуарах.",
            "specializations": ["Вязание", "Крючок", "Детская одежда"],
            "phone": "+7 (911) 111-11-11"
        },
        {
            "email": "ivan.wood@example.ru",
            "name": "Иван Плотников",
            "password": "master123",
            "role": "master",
            "bio": "Создаю уникальные изделия из дерева: мебель, декор, подарки.",
            "specializations": ["Столярное дело", "Резьба по дереву", "Мебель"],
            "phone": "+7 (922) 222-22-22"
        },
        {
            "email": "maria.embroidery@example.ru",
            "name": "Мария Иванова",
            "password": "master123",
            "role": "master",
            "bio": "Вышиваю картины и украшаю одежду. Работаю с любыми тканями.",
            "specializations": ["Вышивка", "Ручная вышивка", "Картины"],
            "phone": "+7 (933) 333-33-33"
        }
    ]
    
    created_masters = []
    for master_data in masters_data:
        existing = await db.users.find_one({"email": master_data["email"]})
        if not existing:
            master = {
                "id": str(uuid.uuid4()),
                "email": master_data["email"],
                "name": master_data["name"],
                "role": master_data["role"],
                "password_hash": hash_password(master_data["password"]),
                "phone": master_data["phone"],
                "bio": master_data["bio"],
                "specializations": master_data["specializations"],
                "avatar": None,
                "rating": 4.5 + (len(created_masters) * 0.2),
                "total_reviews": 5 + len(created_masters),
                "completed_orders": 10 + (len(created_masters) * 5),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(master)
            created_masters.append(master)
            print(f"✅ Мастер создан: {master['email']} / master123")
        else:
            created_masters.append(existing)
            print(f"ℹ️  Мастер уже существует: {master_data['email']}")
    
    # 3. Создаем тестовых клиентов
    customers_data = [
        {
            "email": "customer1@example.ru",
            "name": "Петр Заказчиков",
            "password": "customer123",
            "role": "customer",
            "phone": "+7 (944) 444-44-44"
        },
        {
            "email": "customer2@example.ru",
            "name": "Елена Покупателева",
            "password": "customer123",
            "role": "customer",
            "phone": "+7 (955) 555-55-55"
        }
    ]
    
    created_customers = []
    for customer_data in customers_data:
        existing = await db.users.find_one({"email": customer_data["email"]})
        if not existing:
            customer = {
                "id": str(uuid.uuid4()),
                "email": customer_data["email"],
                "name": customer_data["name"],
                "role": customer_data["role"],
                "password_hash": hash_password(customer_data["password"]),
                "phone": customer_data.get("phone"),
                "bio": None,
                "specializations": [],
                "avatar": None,
                "rating": 0.0,
                "total_reviews": 0,
                "completed_orders": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(customer)
            created_customers.append(customer)
            print(f"✅ Клиент создан: {customer['email']} / customer123")
        else:
            created_customers.append(existing)
            print(f"ℹ️  Клиент уже существует: {customer_data['email']}")
    
    # 4. Создаем тестовые услуги
    services_data = [
        # Услуги Анны
        {
            "title": "Вязаные детские носочки",
            "description": "Теплые и уютные носочки для малышей. Использую только натуральную пряжу. Размеры от 0 до 3 лет. Возможен выбор цвета и узора.",
            "category": "knitting",
            "price": 800.0,
            "duration_days": 5,
            "master_idx": 0
        },
        {
            "title": "Вязаный шарф ручной работы",
            "description": "Стильный и теплый шарф из мериносовой шерсти. Длина 180см. Большой выбор цветов и узоров.",
            "category": "knitting",
            "price": 2500.0,
            "duration_days": 7,
            "master_idx": 0
        },
        # Услуги Ивана
        {
            "title": "Деревянная разделочная доска",
            "description": "Разделочная доска из массива дуба. Покрытие минеральным маслом. Размеры 40x25см. Возможна гравировка имени.",
            "category": "woodworking",
            "price": 3500.0,
            "duration_days": 10,
            "master_idx": 1
        },
        {
            "title": "Деревянная шкатулка для украшений",
            "description": "Красивая шкатулка ручной работы из ценных пород дерева. Внутренняя отделка бархатом. Размер 20x15x10см.",
            "category": "woodworking",
            "price": 5000.0,
            "duration_days": 14,
            "master_idx": 1
        },
        # Услуги Марии
        {
            "title": "Вышитая картина на заказ",
            "description": "Создам вышитую картину по вашему эскизу или фото. Размер от А4 до А3. Использую качественные нити и канву.",
            "category": "embroidery",
            "price": 8000.0,
            "duration_days": 21,
            "master_idx": 2
        },
        {
            "title": "Вышивка на одежде",
            "description": "Украшу вашу одежду красивой вышивкой: монограммы, узоры, логотипы. Работаю с любыми тканями.",
            "category": "embroidery",
            "price": 1500.0,
            "duration_days": 7,
            "master_idx": 2
        }
    ]
    
    created_services = []
    for service_data in services_data:
        master = created_masters[service_data["master_idx"]]
        existing = await db.services.find_one({
            "master_id": master["id"],
            "title": service_data["title"]
        })
        
        if not existing:
            service = {
                "id": str(uuid.uuid4()),
                "master_id": master["id"],
                "title": service_data["title"],
                "description": service_data["description"],
                "category": service_data["category"],
                "price": service_data["price"],
                "currency": "RUB",
                "duration_days": service_data["duration_days"],
                "images": [],
                "is_active": True,
                "views": 0,
                "orders_count": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.services.insert_one(service)
            created_services.append(service)
            print(f"✅ Услуга создана: {service['title']}")
        else:
            created_services.append(existing)
            print(f"ℹ️  Услуга уже существует: {service_data['title']}")
    
    print("\n" + "="*50)
    print("🎉 Инициализация завершена!")
    print("="*50)
    print("\n📋 Учетные данные для входа:\n")
    print("👑 АДМИНИСТРАТОР:")
    print("   Email: admin@platform.ru")
    print("   Пароль: admin123")
    print("\n👨‍🎨 МАСТЕРА:")
    for master_data in masters_data:
        print(f"   Email: {master_data['email']}")
        print(f"   Пароль: master123")
    print("\n👤 КЛИЕНТЫ:")
    for customer_data in customers_data:
        print(f"   Email: {customer_data['email']}")
        print(f"   Пароль: customer123")
    print("\n" + "="*50)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(init_database())
