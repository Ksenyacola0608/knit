"""
Скрипт для добавления тестовых отзывов
"""
import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
import uuid
import os
from dotenv import load_dotenv
import random

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')

# Тестовые отзывы
REVIEWS_DATA = [
    {
        "rating": 5,
        "comment": "Отличная работа! Мастер очень внимательный, учел все мои пожелания. Изделие получилось именно таким, как я хотела. Рекомендую!"
    },
    {
        "rating": 5,
        "comment": "Превосходное качество работы! Все сделано аккуратно и в срок. Буду обращаться еще."
    },
    {
        "rating": 4,
        "comment": "Хорошая работа, качественно выполнено. Единственное - немного задержали срок, но результат того стоил."
    },
    {
        "rating": 5,
        "comment": "Замечательный мастер! Очень приятно было работать. Изделие получилось даже лучше, чем я ожидала."
    },
    {
        "rating": 4,
        "comment": "Качество отличное, все как договаривались. Немного дороговато, но оно того стоит."
    },
    {
        "rating": 5,
        "comment": "Профессионал своего дела! Быстро, качественно, красиво. Всем рекомендую этого мастера."
    },
    {
        "rating": 3,
        "comment": "В целом неплохо, но были небольшие недочеты. Мастер все исправил по моей просьбе."
    },
    {
        "rating": 5,
        "comment": "Великолепная работа! Мастер - настоящий художник. Изделие получилось произведением искусства!"
    },
    {
        "rating": 4,
        "comment": "Работой доволен. Все аккуратно и качественно. Немного дольше ожидал, но результат хороший."
    },
    {
        "rating": 5,
        "comment": "Потрясающе! Именно то, что я искал. Мастер понял с полуслова, что мне нужно. Спасибо!"
    }
]

async def create_test_reviews():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.handcraft_platform
    
    print("🚀 Начинаем добавление тестовых отзывов...")
    
    # Получаем всех мастеров
    masters = await db.users.find({"role": "master"}, {"_id": 0, "id": 1, "name": 1}).to_list(100)
    
    if not masters:
        print("❌ Мастера не найдены в базе данных")
        client.close()
        return
    
    print(f"✅ Найдено мастеров: {len(masters)}")
    
    # Получаем всех клиентов
    customers = await db.users.find({"role": "customer"}, {"_id": 0, "id": 1, "name": 1}).to_list(100)
    
    if not customers:
        print("❌ Клиенты не найдены в базе данных")
        client.close()
        return
    
    print(f"✅ Найдено клиентов: {len(customers)}")
    
    reviews_created = 0
    orders_created = 0
    
    # Для каждого мастера создадим несколько отзывов
    for master in masters:
        # Получаем услуги мастера
        services = await db.services.find(
            {"master_id": master["id"]},
            {"_id": 0, "id": 1, "title": 1, "price": 1}
        ).to_list(100)
        
        if not services:
            print(f"⚠️  У мастера {master['name']} нет услуг, пропускаем")
            continue
        
        # Создаем 3-5 отзывов для каждого мастера
        num_reviews = random.randint(3, 5)
        
        for i in range(num_reviews):
            # Выбираем случайного клиента и случайную услугу
            customer = random.choice(customers)
            service = random.choice(services)
            
            # Проверяем, нет ли уже заказа от этого клиента на эту услугу
            existing_order = await db.orders.find_one({
                "customer_id": customer["id"],
                "service_id": service["id"]
            })
            
            if existing_order:
                order_id = existing_order["id"]
            else:
                # Создаем завершенный заказ
                order_id = str(uuid.uuid4())
                order = {
                    "id": order_id,
                    "customer_id": customer["id"],
                    "master_id": master["id"],
                    "service_id": service["id"],
                    "description": f"Заказ услуги: {service['title']}",
                    "status": "completed",
                    "agreed_price": service.get("price", 1000),
                    "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(10, 60))).isoformat(),
                    "completed_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 9))).isoformat()
                }
                await db.orders.insert_one(order)
                orders_created += 1
            
            # Проверяем, нет ли уже отзыва на этот заказ
            existing_review = await db.reviews.find_one({"order_id": order_id})
            
            if existing_review:
                continue
            
            # Создаем отзыв
            review_data = random.choice(REVIEWS_DATA)
            review = {
                "id": str(uuid.uuid4()),
                "order_id": order_id,
                "master_id": master["id"],
                "customer_id": customer["id"],
                "service_id": service["id"],
                "rating": review_data["rating"],
                "comment": review_data["comment"],
                "is_disputed": False,
                "dispute_reason": None,
                "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 7))).isoformat()
            }
            
            await db.reviews.insert_one(review)
            reviews_created += 1
            print(f"  ✅ Создан отзыв для {master['name']} от {customer['name']} (⭐{review_data['rating']})")
        
        # Пересчитываем рейтинг мастера
        pipeline = [
            {"$match": {"master_id": master["id"]}},
            {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}}
        ]
        result = await db.reviews.aggregate(pipeline).to_list(1)
        
        if result:
            avg_rating = round(result[0]["avg_rating"], 2)
            total_reviews = result[0]["count"]
            await db.users.update_one(
                {"id": master["id"]},
                {"$set": {
                    "rating": avg_rating,
                    "total_reviews": total_reviews,
                    "completed_orders": orders_created
                }}
            )
            print(f"  📊 Обновлен рейтинг {master['name']}: {avg_rating} ({total_reviews} отзывов)")
    
    print("\n" + "="*60)
    print("🎉 Добавление отзывов завершено!")
    print("="*60)
    print(f"📦 Создано заказов: {orders_created}")
    print(f"⭐ Создано отзывов: {reviews_created}")
    print("="*60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_test_reviews())
