# 🚀 Инструкция по локальному запуску HandyCraft Platform

## 📋 Требования

Перед началом убедитесь, что у вас установлено:

### 1. Python 3.11+
```bash
# Проверка версии
python3 --version
# или
python --version
```

**Установка:**
- **Windows:** https://www.python.org/downloads/
- **macOS:** `brew install python@3.11`
- **Linux (Ubuntu/Debian):** `sudo apt install python3.11 python3-pip`

### 2. Node.js 18+ и npm/yarn
```bash
# Проверка версии
node --version
npm --version
```

**Установка:**
- **Windows/macOS:** https://nodejs.org/
- **Linux (Ubuntu/Debian):** 
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. MongoDB
```bash
# Проверка
mongod --version
```

**Установка:**
- **Windows:** https://www.mongodb.com/try/download/community
- **macOS:** `brew tap mongodb/brew && brew install mongodb-community`
- **Linux (Ubuntu/Debian):**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### 4. Git
```bash
git --version
```

---

## 📥 Шаг 1: Клонирование проекта

```bash
# Клонируйте репозиторий
git clone <URL_вашего_репозитория>

# Перейдите в директорию проекта
cd handycraft-platform
```

---

## 🔧 Шаг 2: Настройка Backend (Python)

### 2.1 Создайте виртуальное окружение
```bash
cd backend

# Создание виртуального окружения
python3 -m venv venv

# Активация виртуального окружения
# Для Linux/macOS:
source venv/bin/activate

# Для Windows:
venv\Scripts\activate
```

### 2.2 Установите зависимости
```bash
pip install -r requirements.txt
```

### 2.3 Создайте файл .env
Создайте файл `backend/.env`:

```bash
# Скопируйте пример
cp .env.example .env

# Или создайте новый файл со следующим содержимым:
```

Содержимое `backend/.env`:
```env
# MongoDB
MONGO_URL=mongodb://localhost:27017

# JWT
SECRET_KEY=your-secret-key-change-this-in-production-min-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS
CORS_ORIGINS=http://localhost:3000

# Server
HOST=0.0.0.0
PORT=8001
```

**⚠️ ВАЖНО:** Измените `SECRET_KEY` на случайную строку минимум 32 символа!

Для генерации секретного ключа:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🎨 Шаг 3: Настройка Frontend (React)

### 3.1 Перейдите в директорию frontend
```bash
cd ../frontend
```

### 3.2 Установите зависимости
```bash
# Используйте yarn (рекомендуется)
yarn install

# Или npm
npm install
```

### 3.3 Создайте файл .env
Создайте файл `frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 🗄️ Шаг 4: Запуск MongoDB

### Вариант A: Локальный MongoDB

```bash
# Linux/macOS
sudo systemctl start mongod
# или
sudo service mongod start

# macOS с Homebrew
brew services start mongodb-community

# Windows - MongoDB запускается автоматически как служба
# Или запустите вручную:
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

### Вариант B: MongoDB в Docker (альтернатива)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:6.0
```

### Проверка подключения
```bash
mongosh
# Должно подключиться к localhost:27017
```

---

## 📊 Шаг 5: Инициализация базы данных

### 5.1 Создайте тестовые данные

```bash
cd backend

# Убедитесь что виртуальное окружение активно
source venv/bin/activate  # Linux/macOS
# или
venv\Scripts\activate  # Windows

# Запустите скрипт инициализации
python3 init_data.py
```

Этот скрипт создаст:
- ✅ Администратора (admin@platform.ru / admin123)
- ✅ 3 мастера с тестовыми данными
- ✅ 2 клиента
- ✅ 6 услуг
- ✅ Тестовые отзывы

### 5.2 Создайте аватары для пользователей

```bash
# Установите Pillow если еще не установлена
pip install pillow

# Сгенерируйте аватары
python3 generate_avatars.py
```

---

## 🚀 Шаг 6: Запуск приложения

### Вариант A: Запуск в двух терминалах (рекомендуется)

#### Терминал 1 - Backend
```bash
cd backend
source venv/bin/activate  # Linux/macOS
# или venv\Scripts\activate  # Windows

# Запуск сервера
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Вы должны увидеть:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:     Application startup complete.
```

#### Терминал 2 - Frontend
```bash
cd frontend

# Запуск React приложения
yarn start
# или
npm start
```

Браузер автоматически откроется на `http://localhost:3000`

### Вариант B: Запуск в фоновом режиме

```bash
# Backend в фоне
cd backend
source venv/bin/activate
nohup uvicorn server:app --host 0.0.0.0 --port 8001 > backend.log 2>&1 &

# Frontend в фоне
cd ../frontend
nohup yarn start > frontend.log 2>&1 &
```

---

## 🌐 Шаг 7: Доступ к приложению

### Откройте браузер и перейдите:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001
- **API Документация:** http://localhost:8001/docs

### 🔑 Тестовые учетные данные:

#### Администратор
```
Email: admin@platform.ru
Пароль: admin123
```

#### Мастера
```
Email: anna.knit@example.ru / ivan.wood@example.ru / maria.embroidery@example.ru
Пароль: master123
```

#### Клиенты
```
Email: customer1@example.ru / customer2@example.ru
Пароль: customer123
```

---

## 🔍 Проверка работоспособности

### 1. Проверьте Backend
```bash
curl http://localhost:8001/api/health
# Ответ: {"status":"healthy","database":"connected"}
```

### 2. Проверьте Frontend
Откройте http://localhost:3000 - должна отобразиться главная страница

### 3. Проверьте MongoDB
```bash
mongosh
use handcraft_platform
db.users.countDocuments()
# Должно вернуть количество пользователей (минимум 6)
```

---

## 🛠️ Полезные команды

### Backend
```bash
# Остановить сервер: Ctrl+C

# Проверить логи
tail -f backend.log

# Переустановить зависимости
pip install -r requirements.txt --force-reinstall

# Создать новую миграцию/пользователя
python3 init_data.py
```

### Frontend
```bash
# Остановить: Ctrl+C

# Очистить кэш
yarn cache clean
rm -rf node_modules
yarn install

# Собрать production версию
yarn build
```

### MongoDB
```bash
# Остановить MongoDB
sudo systemctl stop mongod

# Перезапустить
sudo systemctl restart mongod

# Очистить базу данных (ОСТОРОЖНО!)
mongosh
use handcraft_platform
db.dropDatabase()
```

---

## ❌ Решение проблем

### Проблема: Backend не запускается

**Ошибка:** `ModuleNotFoundError: No module named 'fastapi'`

**Решение:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Проблема: MongoDB не подключается

**Ошибка:** `ServerSelectionTimeoutError`

**Решение:**
1. Убедитесь что MongoDB запущен:
```bash
sudo systemctl status mongod
```

2. Проверьте MONGO_URL в `backend/.env`:
```env
MONGO_URL=mongodb://localhost:27017
```

### Проблема: Frontend не запускается

**Ошибка:** `Cannot find module`

**Решение:**
```bash
cd frontend
rm -rf node_modules package-lock.json
yarn install
# или npm install
```

### Проблема: CORS ошибки

**Ошибка:** `Access-Control-Allow-Origin`

**Решение:** Проверьте `backend/.env`:
```env
CORS_ORIGINS=http://localhost:3000
```

### Проблема: Порт уже занят

**Ошибка:** `Address already in use`

**Решение:**
```bash
# Найти процесс на порту 8001
lsof -i :8001
# или на Windows
netstat -ano | findstr :8001

# Убить процесс
kill -9 <PID>
# или на Windows
taskkill /PID <PID> /F
```

---

## 📁 Структура проекта

```
handycraft-platform/
├── backend/
│   ├── models/           # Pydantic модели
│   ├── routers/          # API endpoints
│   ├── utils/            # Утилиты (auth, security)
│   ├── uploads/          # Загруженные файлы
│   │   ├── avatars/      # Аватары пользователей
│   │   └── services/     # Фото услуг
│   ├── server.py         # Главный файл FastAPI
│   ├── database.py       # Подключение к MongoDB
│   ├── init_data.py      # Инициализация данных
│   ├── generate_avatars.py  # Генерация аватаров
│   ├── requirements.txt  # Python зависимости
│   └── .env              # Переменные окружения
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React компоненты
│   │   ├── pages/        # Страницы
│   │   ├── context/      # Context API
│   │   ├── utils/        # Утилиты
│   │   └── App.js        # Главный компонент
│   ├── package.json      # Node зависимости
│   └── .env              # Переменные окружения
│
└── docs/                 # Документация
```

---

## 🎯 Что дальше?

После успешного запуска вы можете:

1. **Зарегистрироваться** как мастер или клиент
2. **Создать услуги** (как мастер)
3. **Загрузить фотографии** профиля и услуг
4. **Разместить заказы** (как клиент)
5. **Оставить отзывы** на завершенные заказы
6. **Настроить профиль** с аватаром и специализациями

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в терминале
2. Убедитесь что все сервисы запущены
3. Проверьте файлы .env
4. Обратитесь к разделу "Решение проблем" выше

---

## 🔒 Безопасность

⚠️ **Для продакшена:**
- Измените `SECRET_KEY` на случайную строку
- Используйте HTTPS
- Настройте правильные CORS_ORIGINS
- Не храните секреты в репозитории
- Используйте переменные окружения
- Настройте файрвол и ограничения доступа

---

**Удачного использования HandyCraft Platform! 🎨**
