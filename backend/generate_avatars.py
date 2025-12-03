"""
Создание простых аватаров-заглушек для пользователей
"""
import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from PIL import Image, ImageDraw, ImageFont
import random

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
AVATAR_DIR = Path("/app/backend/uploads/avatars")

# Цветовые схемы для аватаров
COLOR_SCHEMES = [
    ("#667eea", "#764ba2"),  # Purple
    ("#f093fb", "#f5576c"),  # Pink
    ("#4facfe", "#00f2fe"),  # Blue
    ("#43e97b", "#38f9d7"),  # Green
    ("#fa709a", "#fee140"),  # Orange
    ("#30cfd0", "#330867"),  # Teal
    ("#a8edea", "#fed6e3"),  # Light
    ("#ff9a56", "#ff6a88"),  # Coral
]

def create_avatar(name: str, size: int = 200):
    """Создает аватар с инициалами"""
    # Создаем изображение с градиентом
    img = Image.new('RGB', (size, size))
    draw = ImageDraw.Draw(img)
    
    # Выбираем цветовую схему
    colors = random.choice(COLOR_SCHEMES)
    
    # Рисуем градиент
    for i in range(size):
        r1, g1, b1 = tuple(int(colors[0][j:j+2], 16) for j in (1, 3, 5))
        r2, g2, b2 = tuple(int(colors[1][j:j+2], 16) for j in (1, 3, 5))
        
        r = int(r1 + (r2 - r1) * i / size)
        g = int(g1 + (g2 - g1) * i / size)
        b = int(b1 + (b2 - b1) * i / size)
        
        draw.line([(0, i), (size, i)], fill=(r, g, b))
    
    # Получаем инициалы
    parts = name.split()
    if len(parts) >= 2:
        initials = parts[0][0] + parts[1][0]
    else:
        initials = parts[0][0] if parts else "?"
    
    initials = initials.upper()
    
    # Рисуем текст
    try:
        # Пробуем использовать системный шрифт
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
    except:
        # Если не получается, используем дефолтный
        font = ImageFont.load_default()
    
    # Получаем размер текста
    bbox = draw.textbbox((0, 0), initials, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Позиционируем текст по центру
    x = (size - text_width) / 2
    y = (size - text_height) / 2 - 10
    
    # Рисуем белый текст с тенью
    draw.text((x+2, y+2), initials, fill=(0, 0, 0, 128), font=font)
    draw.text((x, y), initials, fill="white", font=font)
    
    return img

async def generate_avatars():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.handcraft_platform
    
    print("🎨 Генерируем аватары для пользователей без фото...")
    
    # Получаем пользователей без аватаров
    users = await db.users.find(
        {"avatar": None},
        {"_id": 0, "id": 1, "name": 1}
    ).to_list(100)
    
    if not users:
        print("✅ У всех пользователей уже есть аватары")
        client.close()
        return
    
    print(f"Найдено пользователей без аватаров: {len(users)}")
    
    for user in users:
        try:
            # Создаем аватар
            img = create_avatar(user['name'])
            
            # Сохраняем
            filename = f"{user['id']}.png"
            filepath = AVATAR_DIR / filename
            img.save(filepath, "PNG", quality=95)
            
            # Обновляем в БД
            avatar_url = f"/api/upload/avatars/{filename}"
            await db.users.update_one(
                {"id": user['id']},
                {"$set": {"avatar": avatar_url}}
            )
            
            print(f"✅ Создан аватар для {user['name']}")
        
        except Exception as e:
            print(f"❌ Ошибка для {user['name']}: {e}")
    
    print("\n🎉 Генерация завершена!")
    client.close()

if __name__ == "__main__":
    asyncio.run(generate_avatars())
