# API Endpoints: Платформа услуг ручного труда

## Базовый URL

```
Base URL: /api
```

## Аутентификация

Все защищенные endpoints требуют JWT токен в заголовке:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 1. Авторизация

### 1.1 Регистрация

**Endpoint:** `POST /api/auth/register`

**Описание:** Регистрация нового пользователя

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Ivan Ivanov",
  "role": "customer" // or "master",
  "phone": "+7-999-123-45-67"
}
```

**Response (201):**
```json
{
  "token": "jwt-token-string",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Ivan Ivanov",
    "role": "customer",
    "created_at": "2025-01-15T10:00:00.000Z"
  }
}
```

**Errors:**
- `400`: Неверные данные
- `409`: Email уже существует

---

### 1.2 Вход

**Endpoint:** `POST /api/auth/login`

**Описание:** Аутентификация пользователя

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "jwt-token-string",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Ivan Ivanov",
    "role": "customer",
    "avatar": "base64-string",
    "rating": 4.5
  }
}
```

**Errors:**
- `401`: Неверные креденшелы

---

## 2. Пользователи

### 2.1 Получить текущего пользователя

**Endpoint:** `GET /api/users/me`

**Auth Required:** ✓

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Ivan Ivanov",
  "role": "master",
  "phone": "+7-999-123-45-67",
  "avatar": "base64-string",
  "bio": "Опыт работы 5 лет...",
  "specializations": ["knitting", "crochet"],
  "rating": 4.7,
  "total_reviews": 23,
  "completed_orders": 45,
  "created_at": "2025-01-15T10:00:00.000Z"
}
```

---

### 2.2 Обновить профиль

**Endpoint:** `PUT /api/users/me`

**Auth Required:** ✓

**Request Body:**
```json
{
  "name": "Ivan Petrov",
  "phone": "+7-999-999-99-99",
  "bio": "Обновленное описание",
  "specializations": ["knitting", "embroidery"],
  "avatar": "base64-image-string"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Ivan Petrov",
  ...
}
```

---

### 2.3 Получить профиль мастера

**Endpoint:** `GET /api/users/{user_id}`

**Описание:** Публичный профиль мастера

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Ivan Ivanov",
  "avatar": "base64-string",
  "bio": "Описание мастера",
  "specializations": ["knitting"],
  "rating": 4.8,
  "total_reviews": 42,
  "completed_orders": 89,
  "created_at": "2024-06-15T10:00:00.000Z"
}
```

**Errors:**
- `404`: Пользователь не найден

---

## 3. Услуги

### 3.1 Получить список услуг

**Endpoint:** `GET /api/services`

**Query Parameters:**
- `category` (optional): Фильтр по категории
- `search` (optional): Поиск по названию/описанию
- `min_price` (optional): Минимальная цена
- `max_price` (optional): Максимальная цена
- `sort_by` (optional): rating, price, created_at
- `skip` (default: 0): Офсет
- `limit` (default: 20): Количество

**Response (200):**
```json
{
  "total": 150,
  "skip": 0,
  "limit": 20,
  "services": [
    {
      "id": "uuid",
      "master_id": "uuid",
      "master_name": "Ivan Ivanov",
      "master_rating": 4.8,
      "title": "Вязание шерстяных носков",
      "description": "Краткое описание...",
      "category": "knitting",
      "price": 1500,
      "currency": "RUB",
      "duration_days": 7,
      "images": ["base64-thumbnail"],
      "views": 145,
      "orders_count": 12,
      "created_at": "2025-01-10T10:00:00.000Z"
    }
  ]
}
```

---

### 3.2 Получить услугу по ID

**Endpoint:** `GET /api/services/{service_id}`

**Response (200):**
```json
{
  "id": "uuid",
  "master_id": "uuid",
  "master": {
    "id": "uuid",
    "name": "Ivan Ivanov",
    "avatar": "base64-string",
    "rating": 4.8,
    "total_reviews": 42
  },
  "title": "Вязание шерстяных носков",
  "description": "Полное описание услуги...",
  "category": "knitting",
  "price": 1500,
  "currency": "RUB",
  "duration_days": 7,
  "images": ["base64-image-1", "base64-image-2"],
  "is_active": true,
  "views": 146,
  "orders_count": 12,
  "created_at": "2025-01-10T10:00:00.000Z"
}
```

**Errors:**
- `404`: Услуга не найдена

---

### 3.3 Создать услугу

**Endpoint:** `POST /api/services`

**Auth Required:** ✓ (master only)

**Request Body:**
```json
{
  "title": "Вязание шерстяных носков",
  "description": "Подробное описание услуги...",
  "category": "knitting",
  "price": 1500,
  "currency": "RUB",
  "duration_days": 7,
  "images": ["base64-image-1", "base64-image-2"]
}
```

**Response (201):**
```json
{
  "id": "new-uuid",
  "master_id": "current-user-uuid",
  "title": "Вязание шерстяных носков",
  ...
  "created_at": "2025-01-15T10:00:00.000Z"
}
```

**Errors:**
- `401`: Не авторизован
- `403`: Только для мастеров

---

### 3.4 Обновить услугу

**Endpoint:** `PUT /api/services/{service_id}`

**Auth Required:** ✓ (owner only)

**Request Body:** (все поля опциональны)
```json
{
  "title": "Обновленное название",
  "price": 1800,
  "is_active": true
}
```

**Response (200):** Обновленная услуга

**Errors:**
- `403`: Не являетесь владельцем
- `404`: Услуга не найдена

---

### 3.5 Удалить услугу

**Endpoint:** `DELETE /api/services/{service_id}`

**Auth Required:** ✓ (owner only)

**Response (204):** No Content

**Errors:**
- `403`: Не являетесь владельцем
- `404`: Услуга не найдена

---

### 3.6 Получить услуги мастера

**Endpoint:** `GET /api/services/master/{master_id}`

**Query Parameters:**
- `skip`, `limit`

**Response (200):** Список услуг мастера

---

## 4. Заказы

### 4.1 Создать заказ

**Endpoint:** `POST /api/orders`

**Auth Required:** ✓

**Request Body:**
```json
{
  "service_id": "uuid",
  "description": "Описание заказа",
  "customer_notes": "Пожелания",
  "attachments": ["base64-image"]
}
```

**Response (201):**
```json
{
  "id": "new-uuid",
  "service_id": "uuid",
  "customer_id": "current-user-uuid",
  "master_id": "master-uuid",
  "description": "Описание заказа",
  "status": "pending",
  "created_at": "2025-01-15T10:00:00.000Z"
}
```

**Errors:**
- `404`: Услуга не найдена

---

### 4.2 Получить список заказов

**Endpoint:** `GET /api/orders`

**Auth Required:** ✓

**Query Parameters:**
- `status` (optional): Фильтр по статусу
- `role` (optional): "customer" | "master" (какие заказы показать)
- `skip`, `limit`

**Response (200):**
```json
{
  "total": 25,
  "skip": 0,
  "limit": 20,
  "orders": [
    {
      "id": "uuid",
      "service": {
        "id": "uuid",
        "title": "Вязание носков",
        "price": 1500
      },
      "customer": {
        "id": "uuid",
        "name": "Maria Ivanova"
      },
      "master": {
        "id": "uuid",
        "name": "Ivan Petrov",
        "rating": 4.8
      },
      "status": "pending",
      "created_at": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### 4.3 Получить заказ по ID

**Endpoint:** `GET /api/orders/{order_id}`

**Auth Required:** ✓ (customer or master only)

**Response (200):**
```json
{
  "id": "uuid",
  "service_id": "uuid",
  "service": {
    "id": "uuid",
    "title": "Вязание носков",
    "images": ["base64-thumbnail"]
  },
  "customer_id": "uuid",
  "customer": {
    "id": "uuid",
    "name": "Maria Ivanova",
    "avatar": "base64"
  },
  "master_id": "uuid",
  "master": {
    "id": "uuid",
    "name": "Ivan Petrov",
    "avatar": "base64",
    "rating": 4.8
  },
  "description": "Описание заказа",
  "customer_notes": "Пожелания",
  "attachments": ["base64-image"],
  "status": "in_progress",
  "agreed_price": 1500,
  "deadline": "2025-01-25T10:00:00.000Z",
  "created_at": "2025-01-15T10:00:00.000Z",
  "updated_at": "2025-01-16T10:00:00.000Z"
}
```

**Errors:**
- `403`: Нет доступа
- `404`: Заказ не найден

---

### 4.4 Обновить статус заказа

**Endpoint:** `PATCH /api/orders/{order_id}/status`

**Auth Required:** ✓ (master only)

**Request Body:**
```json
{
  "status": "accepted", // "accepted", "rejected", "in_progress", "completed"
  "agreed_price": 1800,
  "deadline": "2025-01-25T10:00:00.000Z"
}
```

**Response (200):** Обновленный заказ

**Errors:**
- `403`: Нет доступа
- `400`: Неверный переход статуса

---

## 5. Отзывы

### 5.1 Создать отзыв

**Endpoint:** `POST /api/reviews`

**Auth Required:** ✓ (customer, order must be completed)

**Request Body:**
```json
{
  "order_id": "uuid",
  "rating": 5,
  "comment": "Отличная работа!"
}
```

**Response (201):**
```json
{
  "id": "new-uuid",
  "order_id": "uuid",
  "master_id": "uuid",
  "customer_id": "current-user-uuid",
  "service_id": "uuid",
  "rating": 5,
  "comment": "Отличная работа!",
  "created_at": "2025-01-15T10:00:00.000Z"
}
```

**Errors:**
- `400`: Заказ еще не завершен
- `409`: Отзыв уже оставлен

---

### 5.2 Получить отзывы мастера

**Endpoint:** `GET /api/reviews/master/{master_id}`

**Query Parameters:**
- `skip`, `limit`
- `sort` (optional): "newest" | "highest" | "lowest"

**Response (200):**
```json
{
  "total": 42,
  "skip": 0,
  "limit": 20,
  "reviews": [
    {
      "id": "uuid",
      "customer": {
        "id": "uuid",
        "name": "Maria Ivanova",
        "avatar": "base64"
      },
      "service": {
        "id": "uuid",
        "title": "Вязание носков"
      },
      "rating": 5,
      "comment": "Отличная работа!",
      "created_at": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### 5.3 Получить отзывы услуги

**Endpoint:** `GET /api/reviews/service/{service_id}`

**Query Parameters:** `skip`, `limit`, `sort`

**Response (200):** Аналогично 5.2

---

## 6. Сообщения (Чат)

### 6.1 Получить сообщения заказа

**Endpoint:** `GET /api/messages/order/{order_id}`

**Auth Required:** ✓ (customer or master only)

**Query Parameters:**
- `skip`, `limit`

**Response (200):**
```json
{
  "total": 15,
  "messages": [
    {
      "id": "uuid",
      "order_id": "uuid",
      "sender_id": "uuid",
      "sender_name": "Ivan Petrov",
      "content": "Здравствуйте!",
      "is_read": true,
      "created_at": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### 6.2 Отправить сообщение

**Endpoint:** `POST /api/messages`

**Auth Required:** ✓

**Request Body:**
```json
{
  "order_id": "uuid",
  "content": "Текст сообщения"
}
```

**Response (201):**
```json
{
  "id": "new-uuid",
  "order_id": "uuid",
  "sender_id": "current-user-uuid",
  "receiver_id": "other-user-uuid",
  "content": "Текст сообщения",
  "is_read": false,
  "created_at": "2025-01-15T10:00:00.000Z"
}
```

---

### 6.3 Пометить сообщения как прочитанные

**Endpoint:** `PATCH /api/messages/order/{order_id}/read`

**Auth Required:** ✓

**Response (200):**
```json
{
  "marked_as_read": 5
}
```

---

### 6.4 Получить список чатов

**Endpoint:** `GET /api/messages/chats`

**Auth Required:** ✓

**Response (200):**
```json
{
  "chats": [
    {
      "order_id": "uuid",
      "order_title": "Вязание носков",
      "other_user": {
        "id": "uuid",
        "name": "Ivan Petrov",
        "avatar": "base64"
      },
      "last_message": {
        "content": "Последнее сообщение",
        "created_at": "2025-01-15T10:00:00.000Z",
        "is_read": false
      },
      "unread_count": 3
    }
  ]
}
```

---

## 7. Уведомления

### 7.1 Получить уведомления

**Endpoint:** `GET /api/notifications`

**Auth Required:** ✓

**Query Parameters:**
- `unread_only` (optional): boolean
- `skip`, `limit`

**Response (200):**
```json
{
  "total": 12,
  "unread_count": 5,
  "notifications": [
    {
      "id": "uuid",
      "type": "new_order",
      "title": "Новый заказ",
      "content": "У вас новый заказ на...",
      "link": "/orders/uuid-123",
      "is_read": false,
      "created_at": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### 7.2 Пометить как прочитанное

**Endpoint:** `PATCH /api/notifications/{notification_id}/read`

**Auth Required:** ✓

**Response (200):**
```json
{
  "id": "uuid",
  "is_read": true
}
```

---

### 7.3 Пометить все как прочитанные

**Endpoint:** `PATCH /api/notifications/read-all`

**Auth Required:** ✓

**Response (200):**
```json
{
  "marked_as_read": 5
}
```

---

## 8. Общие коды ошибок

| Code | Описание |
|------|------------|
| 200 | OK - Успешный запрос |
| 201 | Created - Ресурс создан |
| 204 | No Content - Успешное удаление |
| 400 | Bad Request - Неверные данные |
| 401 | Unauthorized - Не авторизован |
| 403 | Forbidden - Нет доступа |
| 404 | Not Found - Ресурс не найден |
| 409 | Conflict - Конфликт (например, email уже существует) |
| 422 | Unprocessable Entity - Ошибка валидации |
| 500 | Internal Server Error - Внутренняя ошибка сервера |

## 9. Формат ошибок

Все ошибки возвращаются в следующем формате:

```json
{
  "detail": "Описание ошибки"
}
```

Для ошибок валидации (422):

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```
