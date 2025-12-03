# Архитектура системы: Платформа услуг ручного труда

## 1. Общая архитектура

### 1.1 Высокоуровневая архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                        ПОЛЬЗОВАТЕЛИ                          │
│                  (Браузер / Мобильное устройство)            │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    KUBERNETES INGRESS                        │
│                    (Load Balancer)                           │
└─────────────┬──────────────────────────┬────────────────────┘
              │                          │
              │ /                        │ /api/*
              │                          │
┌─────────────▼──────────────┐  ┌────────▼─────────────────────┐
│      FRONTEND SERVICE      │  │     BACKEND SERVICE          │
│      (React App)           │  │     (FastAPI)                │
│      Port: 3000            │◄─┤     Port: 8001               │
│                            │  │                              │
│  - React Router            │  │  - REST API                  │
│  - Shadcn UI               │  │  - JWT Auth                  │
│  - Axios HTTP Client       │  │  - Pydantic Validation       │
│  - State Management        │  │  - Business Logic            │
└────────────────────────────┘  └──────────┬───────────────────┘
                                           │
                                           │ Motor (Async)
                                           │
                                ┌──────────▼───────────────────┐
                                │    MONGODB DATABASE          │
                                │    Port: 27017               │
                                │                              │
                                │  Collections:                │
                                │  - users                     │
                                │  - services                  │
                                │  - orders                    │
                                │  - reviews                   │
                                │  - messages                  │
                                │  - notifications             │
                                └──────────────────────────────┘
```

### 1.2 Компоненты системы

#### Frontend (React)
- **Назначение**: Пользовательский интерфейс
- **Технологии**: React 19, React Router, Tailwind CSS, Shadcn UI
- **Порт**: 3000 (внутренний)
- **Внешний доступ**: через Kubernetes Ingress

#### Backend (FastAPI)
- **Назначение**: REST API, бизнес-логика
- **Технологии**: FastAPI, Pydantic, Motor
- **Порт**: 8001 (внутренний)
- **Внешний доступ**: через Kubernetes Ingress (/api/*)

#### Database (MongoDB)
- **Назначение**: Хранение данных
- **Технологии**: MongoDB 4.5
- **Порт**: 27017 (внутренний)
- **Доступ**: только из Backend

## 2. Архитектура Backend

### 2.1 Структура директорий

```
/app/backend/
├── server.py              # Главный файл приложения
├── requirements.txt       # Python зависимости
├── .env                   # Переменные окружения
├── models/                # Pydantic модели
│   ├── __init__.py
│   ├── user.py           # User модели
│   ├── service.py        # Service модели
│   ├── order.py          # Order модели
│   ├── review.py         # Review модели
│   ├── message.py        # Message модели
│   └── notification.py   # Notification модели
├── routers/               # API маршруты
│   ├── __init__.py
│   ├── auth.py           # Авторизация
│   ├── users.py          # Пользователи
│   ├── services.py       # Услуги
│   ├── orders.py         # Заказы
│   ├── reviews.py        # Отзывы
│   ├── messages.py       # Сообщения
│   └── notifications.py  # Уведомления
├── utils/                 # Вспомогательные функции
│   ├── __init__.py
│   ├── auth.py           # JWT utilities
│   ├── security.py       # Хеширование паролей
│   └── validators.py     # Кастомные валидаторы
└── database/              # Работа с БД
    ├── __init__.py
    └── connection.py     # MongoDB connection
```

### 2.2 Слои Backend

```
┌─────────────────────────────────────────┐
│         API Layer (Routers)             │
│   - Обработка HTTP запросов             │
│   - Валидация входных данных            │
│   - Сериализация ответов                │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│      Business Logic Layer               │
│   - Бизнес-правила                      │
│   - Обработка данных                    │
│   - Расчет рейтингов                    │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│      Data Access Layer                  │
│   - CRUD операции                       │
│   - Запросы к MongoDB                   │
│   - Агрегация данных                    │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         MongoDB Database                │
└─────────────────────────────────────────┘
```

### 2.3 Безопасность Backend

#### JWT Authentication Flow
```
┌────────┐                 ┌────────┐                 ┌────────┐
│ Client │                 │ Server │                 │   DB   │
└───┬────┘                 └───┬────┘                 └───┬────┘
    │                          │                          │
    │ POST /api/auth/login     │                          │
    ├─────────────────────────►│                          │
    │ {email, password}        │  Verify credentials      │
    │                          ├─────────────────────────►│
    │                          │◄─────────────────────────┤
    │                          │  User data               │
    │                          │                          │
    │  JWT Token + User data   │                          │
    │◄─────────────────────────┤                          │
    │                          │                          │
    │ GET /api/users/me        │                          │
    ├─────────────────────────►│                          │
    │ Authorization: Bearer    │  Verify JWT              │
    │                          │                          │
    │                          │  Get user from token     │
    │                          ├─────────────────────────►│
    │  User data               │◄─────────────────────────┤
    │◄─────────────────────────┤                          │
    │                          │                          │
```

## 3. Архитектура Frontend

### 3.1 Структура директорий

```
/app/frontend/src/
├── index.js              # Entry point
├── App.js                # Main app component
├── App.css               # Global styles
├── index.css             # Base styles
├── components/           # React компоненты
│   ├── ui/              # Shadcn UI components
│   ├── layout/          # Layout компоненты
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Sidebar.jsx
│   ├── auth/            # Авторизация
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── services/        # Услуги
│   │   ├── ServiceCard.jsx
│   │   ├── ServiceList.jsx
│   │   ├── ServiceDetail.jsx
│   │   └── ServiceForm.jsx
│   ├── orders/          # Заказы
│   │   ├── OrderCard.jsx
│   │   ├── OrderList.jsx
│   │   ├── OrderForm.jsx
│   │   └── OrderDetail.jsx
│   ├── reviews/         # Отзывы
│   │   ├── ReviewCard.jsx
│   │   ├── ReviewList.jsx
│   │   └── ReviewForm.jsx
│   ├── chat/            # Чат
│   │   ├── ChatWindow.jsx
│   │   ├── ChatList.jsx
│   │   └── MessageInput.jsx
│   └── profile/         # Профиль
│       ├── ProfileView.jsx
│       ├── ProfileEdit.jsx
│       └── MasterProfile.jsx
├── pages/               # Страницы
│   ├── HomePage.jsx
│   ├── ServicesPage.jsx
│   ├── ServiceDetailPage.jsx
│   ├── MasterProfilePage.jsx
│   ├── OrdersPage.jsx
│   ├── OrderDetailPage.jsx
│   ├── ChatPage.jsx
│   ├── ProfilePage.jsx
│   ├── NotificationsPage.jsx
│   ├── LoginPage.jsx
│   └── RegisterPage.jsx
├── hooks/               # Custom hooks
│   ├── useAuth.js
│   ├── useToast.js
│   └── useDebounce.js
├── context/             # React Context
│   └── AuthContext.jsx
├── utils/               # Утилиты
│   ├── api.js          # API client
│   ├── auth.js         # Auth helpers
│   └── formatters.js   # Форматирование данных
└── constants/           # Константы
    └── index.js        # Общие константы
```

### 3.2 Роутинг

```
/                          → HomePage
/services                  → ServicesPage (каталог)
/services/:id              → ServiceDetailPage
/masters/:id               → MasterProfilePage
/orders                    → OrdersPage (мои заказы)
/orders/:id                → OrderDetailPage
/chat                      → ChatPage (список чатов)
/chat/:orderId             → ChatWindow
/profile                   → ProfilePage (мой профиль)
/notifications             → NotificationsPage
/login                     → LoginPage
/register                  → RegisterPage
```

### 3.3 State Management

```
┌─────────────────────────────────────────┐
│          React Context API              │
│                                         │
│  AuthContext:                           │
│  - currentUser                          │
│  - isAuthenticated                      │
│  - login()                              │
│  - logout()                             │
│  - register()                           │
└─────────────────────────────────────────┘
              │
              │ Provides to
              ▼
┌─────────────────────────────────────────┐
│         Application Tree                │
│                                         │
│  Component State (useState):            │
│  - Form data                            │
│  - UI state (loading, modals)           │
│  - Local cache                          │
└─────────────────────────────────────────┘
```

## 4. Модель данных

### 4.1 ER-диаграмма (концептуальная)

```
┌─────────────────┐         ┌─────────────────┐
│     USERS       │         │    SERVICES     │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ email           │◄────────┤ master_id (FK)  │
│ password_hash   │  creates│ title           │
│ name            │         │ description     │
│ role            │         │ category        │
│ avatar          │         │ price           │
│ created_at      │         │ duration        │
└────────┬────────┘         │ images          │
         │                  │ is_active       │
         │                  └────────┬────────┘
         │                           │
         │                           │ has
         │ creates                   │
         │                           │
         │                  ┌────────▼────────┐
         │                  │     ORDERS      │
         │                  ├─────────────────┤
         └─────────────────►│ id (PK)         │
           creates          │ service_id (FK) │
                            │ customer_id(FK) │
                            │ master_id (FK)  │
                            │ description     │
                            │ status          │
                            │ created_at      │
                            └────────┬────────┘
                                     │
                     ┌───────────────┼───────────────┐
                     │               │               │
                     │ has           │ has           │
                     │               │               │
          ┌──────────▼───────┐  ┌────▼─────────┐  ┌─▼───────────┐
          │    REVIEWS       │  │   MESSAGES   │  │NOTIFICATIONS│
          ├──────────────────┤  ├──────────────┤  ├─────────────┤
          │ id (PK)          │  │ id (PK)      │  │ id (PK)     │
          │ order_id (FK)    │  │ order_id(FK) │  │ user_id(FK) │
          │ master_id (FK)   │  │ sender_id(FK)│  │ type        │
          │ customer_id (FK) │  │ content      │  │ content     │
          │ rating           │  │ created_at   │  │ is_read     │
          │ comment          │  └──────────────┘  │ created_at  │
          │ created_at       │                    └─────────────┘
          └──────────────────┘
```

### 4.2 Связи между коллекциями

- **User → Services**: Один ко многим (один мастер создает много услуг)
- **User → Orders (as customer)**: Один ко многим
- **User → Orders (as master)**: Один ко многим
- **Service → Orders**: Один ко многим
- **Order → Reviews**: Один к одному
- **Order → Messages**: Один ко многим
- **User → Notifications**: Один ко многим

## 5. Интеграция и взаимодействие

### 5.1 Frontend ↔ Backend Communication

#### Axios Client Configuration
```javascript
// utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL + '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor для добавления JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor для обработки ошибок
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 5.2 CORS Configuration

```python
# Backend CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # В продакшене указать конкретный домен
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 6. Масштабирование и производительность

### 6.1 Стратегии оптимизации

#### Database Indexing
```javascript
// MongoDB indexes для оптимизации запросов
db.users.createIndex({ email: 1 }, { unique: true })
db.services.createIndex({ master_id: 1, is_active: 1 })
db.services.createIndex({ category: 1 })
db.orders.createIndex({ customer_id: 1, created_at: -1 })
db.orders.createIndex({ master_id: 1, status: 1 })
db.reviews.createIndex({ master_id: 1, created_at: -1 })
db.messages.createIndex({ order_id: 1, created_at: 1 })
db.notifications.createIndex({ user_id: 1, is_read: 1, created_at: -1 })
```

#### Image Optimization
- Сжатие изображений перед сохранением
- Максимальный размер: 500KB
- Формат: JPEG/PNG
- Конвертация в WebP (будущее улучшение)

### 6.2 Горизонтальное масштабирование

```
┌──────────────────────────────────────────────────┐
│            Kubernetes LoadBalancer               │
└─────────────────┬────────────────────────────────┘
                  │
     ┌────────────┼────────────┐
     │            │            │
┌────▼─────┐ ┌───▼──────┐ ┌──▼───────┐
│ Backend  │ │ Backend  │ │ Backend  │
│ Pod 1    │ │ Pod 2    │ │ Pod N    │
└────┬─────┘ └───┬──────┘ └──┬───────┘
     │           │           │
     └───────────┼───────────┘
                 │
         ┌───────▼────────┐
         │   MongoDB      │
         │   Cluster      │
         └────────────────┘
```

### 6.3 Кеширование (Future)

```
┌─────────┐    ┌─────────┐    ┌──────────┐
│ Client  │───►│ Backend │───►│  Redis   │
└─────────┘    └────┬────┘    └──────────┘
                    │              Cache Layer
                    │
               ┌────▼────┐
               │ MongoDB │
               └─────────┘
```

## 7. Обработка ошибок и логирование

### 7.1 Backend Error Handling

```python
from fastapi import HTTPException

# Custom exceptions
class UserNotFoundError(HTTPException):
    def __init__(self):
        super().__init__(status_code=404, detail="User not found")

class UnauthorizedError(HTTPException):
    def __init__(self):
        super().__init__(status_code=401, detail="Unauthorized")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

### 7.2 Logging Strategy

```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/backend.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Log важных операций
logger.info(f"User {user_id} logged in")
logger.warning(f"Failed login attempt for {email}")
logger.error(f"Database connection failed", exc_info=True)
```

## 8. Безопасность

### 8.1 Меры безопасности

1. **Password Hashing**: bcrypt с солью
2. **JWT Tokens**: Short-lived (24 часа)
3. **Input Validation**: Pydantic на backend, Zod на frontend
4. **HTTPS Only**: Все соединения через HTTPS
5. **CORS**: Настроенный CORS policy
6. **Rate Limiting**: (Future) Ограничение запросов

### 8.2 Защита от атак

- **XSS**: React автоматически экранирует
- **CSRF**: JWT в headers (не в cookies)
- **SQL Injection**: MongoDB (NoSQL) + валидация
- **Brute Force**: (Future) Rate limiting на login

## 9. Мониторинг и метрики

### 9.1 Health Checks

```python
@api_router.get("/health")
async def health_check():
    try:
        # Check database connection
        await db.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
```

### 9.2 Метрики для отслеживания

- Response time API endpoints
- Database query performance
- Error rate
- Active users
- Memory usage
- CPU usage

## 10. Deployment Architecture

### 10.1 Docker Containers

```
┌─────────────────────────────────────┐
│        Kubernetes Cluster           │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Frontend Pod                 │ │
│  │  - React App                  │ │
│  │  - Nginx (serve static)       │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Backend Pod (N replicas)     │ │
│  │  - FastAPI                    │ │
│  │  - Uvicorn                    │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  MongoDB Pod                  │ │
│  │  - MongoDB 4.5                │ │
│  │  - Persistent Volume          │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 10.2 Environment Variables

**Backend (.env)**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=handcraft_platform
CORS_ORIGINS=*
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION=1440  # 24 hours in minutes
```

**Frontend (.env)**
```
REACT_APP_BACKEND_URL=https://crafty-connect.preview.emergentagent.com
```
