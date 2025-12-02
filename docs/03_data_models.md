# Модели данных: Платформа услуг ручного труда

## 1. Коллекция: users

### 1.1 Структура документа

```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "password_hash": "bcrypt-hashed-password",
  "name": "Ivan Ivanov",
  "role": "customer | master",
  "phone": "+7-999-123-45-67",
  "avatar": "base64-encoded-image",
  "bio": "Описание пользователя",
  "specializations": ["knitting", "embroidery"],
  "rating": 4.5,
  "total_reviews": 23,
  "completed_orders": 45,
  "created_at": "2025-01-15T10:00:00.000Z",
  "updated_at": "2025-01-15T10:00:00.000Z"
}
```

### 1.2 Описание полей

| Поле | Тип | Обязательное | Уникальное | Описание |
|------|------|--------------|------------|------------|
| id | String (UUID) | ✓ | ✓ | Уникальный идентификатор |
| email | String | ✓ | ✓ | Email адрес (валидируется) |
| password_hash | String | ✓ | - | bcrypt хеш пароля |
| name | String | ✓ | - | Полное имя |
| role | Enum | ✓ | - | "customer" или "master" |
| phone | String | - | - | Телефон |
| avatar | String (Base64) | - | - | Аватар в Base64 |
| bio | String | - | - | Описание (только для мастеров) |
| specializations | Array[String] | - | - | Специализации (только для мастеров) |
| rating | Float | - | - | Средний рейтинг (0-5) |
| total_reviews | Integer | - | - | Количество отзывов |
| completed_orders | Integer | - | - | Количество выполненных заказов |
| created_at | DateTime (ISO) | ✓ | - | Дата создания |
| updated_at | DateTime (ISO) | ✓ | - | Дата обновления |

### 1.3 Индексы

```javascript
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })
db.users.createIndex({ "rating": -1 }) // Для сортировки
```

### 1.4 Валидация

- **email**: валидный email формат
- **password**: минимум 6 символов (до хеширования)
- **role**: только "customer" или "master"
- **rating**: 0-5
- **phone**: опциональный формат телефона

---

## 2. Коллекция: services

### 2.1 Структура документа

```json
{
  "id": "uuid-string",
  "master_id": "uuid-ref-to-user",
  "title": "Вязание шерстяных носков",
  "description": "Подробное описание услуги...",
  "category": "knitting",
  "price": 1500,
  "currency": "RUB",
  "duration_days": 7,
  "images": [
    "base64-encoded-image-1",
    "base64-encoded-image-2"
  ],
  "is_active": true,
  "views": 145,
  "orders_count": 12,
  "created_at": "2025-01-15T10:00:00.000Z",
  "updated_at": "2025-01-15T10:00:00.000Z"
}
```

### 2.2 Описание полей

| Поле | Тип | Обязательное | Описание |
|------|------|--------------|------------|
| id | String (UUID) | ✓ | Уникальный идентификатор |
| master_id | String (UUID) | ✓ | ID мастера (ссылка на users) |
| title | String | ✓ | Название услуги |
| description | String | ✓ | Подробное описание |
| category | Enum | ✓ | Категория (книттинг, вышивка, ...) |
| price | Float | ✓ | Примерная цена |
| currency | String | ✓ | Валюта (RUB, USD, ...) |
| duration_days | Integer | - | Примерный срок выполнения (дни) |
| images | Array[String] | - | Массив изображений (Base64) |
| is_active | Boolean | ✓ | Активна ли услуга |
| views | Integer | - | Количество просмотров |
| orders_count | Integer | - | Количество заказов |
| created_at | DateTime (ISO) | ✓ | Дата создания |
| updated_at | DateTime (ISO) | ✓ | Дата обновления |

### 2.3 Категории услуг

```python
CATEGORIES = [
    "knitting",        # Вязание
    "embroidery",      # Вышивка
    "sewing",          # Шитье
    "crochet",         # Вязание крючком
    "jewelry",         # Ювелирные украшения
    "pottery",         # Керамика
    "woodworking",     # Работы по дереву
    "painting",        # Роспись
    "soap_making",     # Мыловарение
    "other"            # Другое
]
```

### 2.4 Индексы

```javascript
db.services.createIndex({ "master_id": 1, "is_active": 1 })
db.services.createIndex({ "category": 1 })
db.services.createIndex({ "price": 1 })
db.services.createIndex({ "created_at": -1 })
```

---

## 3. Коллекция: orders

### 3.1 Структура документа

```json
{
  "id": "uuid-string",
  "service_id": "uuid-ref-to-service",
  "customer_id": "uuid-ref-to-user",
  "master_id": "uuid-ref-to-user",
  "description": "Описание заказа от клиента",
  "customer_notes": "Пожелания к заказу",
  "attachments": [
    "base64-image-reference"
  ],
  "status": "pending",
  "agreed_price": 1500,
  "deadline": "2025-01-25T10:00:00.000Z",
  "created_at": "2025-01-15T10:00:00.000Z",
  "updated_at": "2025-01-15T10:00:00.000Z",
  "completed_at": null
}
```

### 3.2 Описание полей

| Поле | Тип | Обязательное | Описание |
|------|------|--------------|------------|
| id | String (UUID) | ✓ | Уникальный идентификатор |
| service_id | String (UUID) | ✓ | ID услуги |
| customer_id | String (UUID) | ✓ | ID заказчика |
| master_id | String (UUID) | ✓ | ID мастера |
| description | String | ✓ | Описание заказа |
| customer_notes | String | - | Пожелания клиента |
| attachments | Array[String] | - | Вложенные файлы (Base64) |
| status | Enum | ✓ | Статус заказа |
| agreed_price | Float | - | Согласованная цена |
| deadline | DateTime (ISO) | - | Срок выполнения |
| created_at | DateTime (ISO) | ✓ | Дата создания |
| updated_at | DateTime (ISO) | ✓ | Дата обновления |
| completed_at | DateTime (ISO) | - | Дата завершения |

### 3.3 Статусы заказа

```python
ORDER_STATUSES = {
    "pending": "Ожидает подтверждения мастера",
    "accepted": "Принят мастером",
    "rejected": "Отклонен мастером",
    "in_progress": "В работе",
    "completed": "Выполнен",
    "cancelled": "Отменен"
}
```

### 3.4 Жизненный цикл заказа

```
pending → accepted → in_progress → completed
   │         │
   │         └───────────────────────► rejected
   │
   └─────────────────────────────────► cancelled
```

### 3.5 Индексы

```javascript
db.orders.createIndex({ "customer_id": 1, "created_at": -1 })
db.orders.createIndex({ "master_id": 1, "status": 1 })
db.orders.createIndex({ "service_id": 1 })
db.orders.createIndex({ "status": 1 })
```

---

## 4. Коллекция: reviews

### 4.1 Структура документа

```json
{
  "id": "uuid-string",
  "order_id": "uuid-ref-to-order",
  "master_id": "uuid-ref-to-user",
  "customer_id": "uuid-ref-to-user",
  "service_id": "uuid-ref-to-service",
  "rating": 5,
  "comment": "Отличная работа! Очень доволен!",
  "created_at": "2025-01-15T10:00:00.000Z"
}
```

### 4.2 Описание полей

| Поле | Тип | Обязательное | Описание |
|------|------|--------------|------------|
| id | String (UUID) | ✓ | Уникальный идентификатор |
| order_id | String (UUID) | ✓ | ID заказа |
| master_id | String (UUID) | ✓ | ID мастера |
| customer_id | String (UUID) | ✓ | ID заказчика |
| service_id | String (UUID) | ✓ | ID услуги |
| rating | Integer (1-5) | ✓ | Оценка |
| comment | String | - | Текст отзыва |
| created_at | DateTime (ISO) | ✓ | Дата создания |

### 4.3 Бизнес-правила

1. Отзыв можно оставить только после завершения заказа (status = "completed")
2. Один отзыв на один заказ
3. При создании отзыва обновляется рейтинг мастера

### 4.4 Расчет рейтинга мастера

```python
def update_master_rating(master_id):
    reviews = db.reviews.find({"master_id": master_id})
    total_reviews = reviews.count()
    if total_reviews > 0:
        avg_rating = sum([r["rating"] for r in reviews]) / total_reviews
        db.users.update_one(
            {"id": master_id},
            {
                "$set": {
                    "rating": round(avg_rating, 2),
                    "total_reviews": total_reviews
                }
            }
        )
```

### 4.5 Индексы

```javascript
db.reviews.createIndex({ "master_id": 1, "created_at": -1 })
db.reviews.createIndex({ "order_id": 1 }, { unique: true })
db.reviews.createIndex({ "customer_id": 1 })
db.reviews.createIndex({ "service_id": 1 })
```

---

## 5. Коллекция: messages

### 5.1 Структура документа

```json
{
  "id": "uuid-string",
  "order_id": "uuid-ref-to-order",
  "sender_id": "uuid-ref-to-user",
  "receiver_id": "uuid-ref-to-user",
  "content": "Текст сообщения",
  "is_read": false,
  "created_at": "2025-01-15T10:00:00.000Z"
}
```

### 5.2 Описание полей

| Поле | Тип | Обязательное | Описание |
|------|------|--------------|------------|
| id | String (UUID) | ✓ | Уникальный идентификатор |
| order_id | String (UUID) | ✓ | ID заказа (контекст чата) |
| sender_id | String (UUID) | ✓ | ID отправителя |
| receiver_id | String (UUID) | ✓ | ID получателя |
| content | String | ✓ | Текст сообщения |
| is_read | Boolean | ✓ | Прочитано ли |
| created_at | DateTime (ISO) | ✓ | Дата создания |

### 5.3 Индексы

```javascript
db.messages.createIndex({ "order_id": 1, "created_at": 1 })
db.messages.createIndex({ "receiver_id": 1, "is_read": 1 })
db.messages.createIndex({ "sender_id": 1 })
```

---

## 6. Коллекция: notifications

### 6.1 Структура документа

```json
{
  "id": "uuid-string",
  "user_id": "uuid-ref-to-user",
  "type": "new_order",
  "title": "Новый заказ",
  "content": "У вас новый заказ на услугу...",
  "link": "/orders/uuid-123",
  "is_read": false,
  "created_at": "2025-01-15T10:00:00.000Z"
}
```

### 6.2 Описание полей

| Поле | Тип | Обязательное | Описание |
|------|------|--------------|------------|
| id | String (UUID) | ✓ | Уникальный идентификатор |
| user_id | String (UUID) | ✓ | ID получателя |
| type | Enum | ✓ | Тип уведомления |
| title | String | ✓ | Заголовок |
| content | String | ✓ | Текст уведомления |
| link | String | - | Ссылка на связанный объект |
| is_read | Boolean | ✓ | Прочитано ли |
| created_at | DateTime (ISO) | ✓ | Дата создания |

### 6.3 Типы уведомлений

```python
NOTIFICATION_TYPES = {
    "new_order": "Новый заказ",
    "order_accepted": "Заказ принят",
    "order_rejected": "Заказ отклонен",
    "order_completed": "Заказ выполнен",
    "new_message": "Новое сообщение",
    "new_review": "Новый отзыв"
}
```

### 6.4 Индексы

```javascript
db.notifications.createIndex({ "user_id": 1, "is_read": 1, "created_at": -1 })
db.notifications.createIndex({ "type": 1 })
```

---

## 7. Валидация данных (Pydantic Models)

### 7.1 Пример User Model

```python
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum

class UserRole(str, Enum):
    CUSTOMER = "customer"
    MASTER = "master"

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    role: UserRole
    phone: Optional[str] = None
    bio: Optional[str] = None
    specializations: Optional[List[str]] = []

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    avatar: Optional[str] = None
    rating: float = 0.0
    total_reviews: int = 0
    completed_orders: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
```

### 7.2 Пример Service Model

```python
class ServiceCategory(str, Enum):
    KNITTING = "knitting"
    EMBROIDERY = "embroidery"
    SEWING = "sewing"
    CROCHET = "crochet"
    JEWELRY = "jewelry"
    POTTERY = "pottery"
    WOODWORKING = "woodworking"
    PAINTING = "painting"
    SOAP_MAKING = "soap_making"
    OTHER = "other"

class ServiceCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20)
    category: ServiceCategory
    price: float = Field(..., gt=0)
    currency: str = "RUB"
    duration_days: Optional[int] = Field(None, gt=0)
    images: Optional[List[str]] = []

class Service(ServiceCreate):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    master_id: str
    is_active: bool = True
    views: int = 0
    orders_count: int = 0
    created_at: datetime
    updated_at: datetime
```

## 8. Рекомендации по оптимизации

### 8.1 Изображения

- **Максимальный размер**: 500KB
- **Разрешение**: 1200x1200px
- **Формат**: JPEG с качеством 80%
- **Будущее**: миграция на S3/MinIO

### 8.2 Pagination

Для всех списков использовать paginatioн:
- **limit**: 20-50 элементов на страницу
- **skip**: смещение
- **total**: общее количество

### 8.3 Очистка данных

- Удаление старых уведомлений (> 30 дней)
- Архивирование старых заказов (> 1 года)
- TTL indexes для автоматической очистки
