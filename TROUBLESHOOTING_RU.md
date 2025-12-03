# 🔧 Устранение проблем - HandyCraft Platform

## 🚨 Приложение не запускается локально?

### Быстрая диагностика

Выполните эти команды по порядку:

```bash
# 1. Проверка Python
python --version
# Должно быть: Python 3.11 или выше

# 2. Проверка Node.js
node --version
# Должно быть: v18 или выше

# 3. Проверка MongoDB
mongosh
# Должно подключиться к MongoDB

# 4. Проверка установленных пакетов Python
cd backend
pip list | grep -i fastapi
# Должно показать: fastapi, motor, pydantic и др.

# 5. Проверка установленных пакетов Node
cd ../frontend
ls node_modules
# Должна быть папка с множеством модулей
```

---

## ❌ Проблема 1: Python зависимости не установлены

### Симптомы:
```
ModuleNotFoundError: No module named 'fastapi'
ImportError: cannot import name 'FastAPI'
```

### Решение:

```bash
# Шаг 1: Убедитесь что вы в папке backend
cd /path/to/project/backend

# Шаг 2: Создайте виртуальное окружение если его нет
python -m venv venv

# Шаг 3: Активируйте виртуальное окружение
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Вы должны увидеть (venv) в начале строки терминала

# Шаг 4: Обновите pip
pip install --upgrade pip

# Шаг 5: Установите зависимости
pip install -r requirements.txt

# Шаг 6: Проверка
pip list
# Должны быть: fastapi, motor, pydantic, python-jose, passlib
```

---

## ❌ Проблема 2: MongoDB не запущен

### Симптомы:
```
pymongo.errors.ServerSelectionTimeoutError
Connection refused to localhost:27017
```

### Решение:

#### Windows:
```bash
# Способ 1: Через Services
1. Нажмите Win + R
2. Введите: services.msc
3. Найдите "MongoDB Server"
4. Нажмите "Запустить"

# Способ 2: Через командную строку (с правами администратора)
net start MongoDB

# Проверка
mongosh
```

#### macOS:
```bash
# Запуск MongoDB
brew services start mongodb-community

# Или вручную
mongod --config /usr/local/etc/mongod.conf

# Проверка
mongosh
```

#### Linux:
```bash
# Ubuntu/Debian
sudo systemctl start mongodb
sudo systemctl status mongodb

# CentOS/RHEL
sudo service mongodb start
sudo service mongodb status

# Проверка
mongosh
```

### Если MongoDB не установлен:

#### Windows:
1. Скачайте с https://www.mongodb.com/try/download/community
2. Установите MongoDB Community Edition
3. Запустите службу

#### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

---

## ❌ Проблема 3: Frontend зависимости не установлены

### Симптомы:
```
Module not found: Can't resolve 'react'
Module not found: Can't resolve 'react-router-dom'
```

### Решение:

```bash
# Шаг 1: Перейдите в папку frontend
cd /path/to/project/frontend

# Шаг 2: Удалите старые зависимости (если есть проблемы)
rm -rf node_modules
rm yarn.lock

# Шаг 3: Установите зависимости
yarn install

# Или используйте npm
npm install

# Шаг 4: Проверка
ls node_modules
# Должны быть папки: react, react-dom, axios и др.
```

---

## ❌ Проблема 4: Порт уже занят

### Симптомы:
```
Error: listen EADDRINUSE: address already in use :::8001
Port 3000 is already in use
```

### Решение:

#### Найти процесс на порту и убить его:

##### Windows:
```bash
# Найти процесс на порту 8001
netstat -ano | findstr :8001

# Убить процесс (замените PID на номер из предыдущей команды)
taskkill /PID <PID> /F

# Для порта 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

##### macOS/Linux:
```bash
# Найти и убить процесс на порту 8001
lsof -ti:8001 | xargs kill -9

# Для порта 3000
lsof -ti:3000 | xargs kill -9

# Или использовать другой порт
uvicorn server:app --port 8002
# В frontend/.env изменить REACT_APP_BACKEND_URL=http://localhost:8002
```

---

## ❌ Проблема 5: CORS ошибка

### Симптомы:
```
Access to XMLHttpRequest has been blocked by CORS policy
No 'Access-Control-Allow-Origin' header
```

### Решение:

```bash
# Шаг 1: Откройте backend/.env
nano backend/.env
# или используйте любой текстовый редактор

# Шаг 2: Убедитесь что есть эта строка:
CORS_ORIGINS="*"

# Шаг 3: Перезапустите backend
# Ctrl+C в терминале где запущен uvicorn
# Затем снова:
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

---

## ❌ Проблема 6: JWT токен не работает

### Симптомы:
```
401 Unauthorized
Could not validate credentials
```

### Решение:

```bash
# Шаг 1: Проверьте backend/.env
cat backend/.env

# Должны быть эти строки:
JWT_SECRET="your-secret-key-change-in-production"
JWT_ALGORITHM="HS256"
JWT_EXPIRATION="1440"

# Шаг 2: Если их нет, добавьте:
cat >> backend/.env << EOF
JWT_SECRET="handcraft-secret-key"
JWT_ALGORITHM="HS256"
JWT_EXPIRATION="1440"
EOF

# Шаг 3: Перезапустите backend
```

---

## ❌ Проблема 7: Frontend не может подключиться к Backend

### Симптомы:
```
Network Error
ERR_CONNECTION_REFUSED
```

### Решение:

```bash
# Шаг 1: Проверьте что backend запущен
curl http://localhost:8001/api/health
# Должно вернуть: {"status":"healthy","database":"connected"}

# Шаг 2: Проверьте frontend/.env
cat frontend/.env

# Должно быть:
REACT_APP_BACKEND_URL=http://localhost:8001

# Шаг 3: Если используете другой порт для backend, измените URL
# Например, если backend на порту 8002:
# REACT_APP_BACKEND_URL=http://localhost:8002

# Шаг 4: Перезапустите frontend
# Ctrl+C в терминале
yarn start
```

---

## ❌ Проблема 8: База данных пустая, нет пользователей

### Симптомы:
```
Не могу войти
User not found
```

### Решение:

```bash
# Создайте тестового пользователя через API

# Способ 1: Через curl
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Тестовый Пользователь",
    "role": "customer"
  }'

# Способ 2: Через браузер
# Откройте http://localhost:8001/docs
# Найдите POST /api/auth/register
# Нажмите "Try it out"
# Заполните поля и нажмите "Execute"

# Способ 3: Создайте мастера
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "master@example.com",
    "password": "master123",
    "name": "Мастер Иванов",
    "role": "master"
  }'
```

---

## ❌ Проблема 9: Циркулярный импорт (Circular Import)

### Симптомы:
```
ImportError: cannot import name 'get_db' from 'server'
ImportError: cannot import name ... (most likely due to a circular import)
```

### Решение:

```bash
# Эта проблема уже исправлена в проекте
# Создан файл database.py который экспортирует get_db

# Если проблема осталась, проверьте:
# 1. В файле backend/database.py должна быть функция get_db
# 2. В backend/routers/*.py импорты должны быть:
#    from database import get_db
#    НЕ from server import get_db
```

---

## ❌ Проблема 10: Не хватает прав (Permission Denied)

### Симптомы (только на macOS/Linux):
```
Permission denied
EACCES: permission denied
```

### Решение:

```bash
# Дайте права на выполнение
chmod +x backend/server.py

# Или используйте sudo (НЕ рекомендуется для dev)
# Вместо этого проверьте владельца папки:
ls -la
# Если нужно, измените владельца:
sudo chown -R $USER:$USER .
```

---

## 🎯 Пошаговая проверка "Все работает"

Выполните эти шаги в ТОЧНОМ порядке:

### 1. Проверка установки:
```bash
python --version   # >= 3.11
node --version     # >= 18
yarn --version     # любая версия
mongosh           # должно подключиться
```

### 2. Запуск MongoDB:
```bash
# Windows:
net start MongoDB

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongodb
```

### 3. Установка зависимостей Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # или venv\Scripts\activate на Windows
pip install -r requirements.txt
```

### 4. Запуск Backend:
```bash
# В терминале 1 (из папки backend)
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Ждите: "Uvicorn running on http://0.0.0.0:8001"
```

### 5. Проверка Backend:
```bash
# В новом терминале
curl http://localhost:8001/api/health

# Ожидается: {"status":"healthy","database":"connected"}
```

### 6. Установка зависимостей Frontend:
```bash
# В терминале 2
cd frontend
yarn install
```

### 7. Запуск Frontend:
```bash
# В терминале 2 (из папки frontend)
yarn start

# Ждите: "Compiled successfully!"
# Откроется браузер на http://localhost:3000
```

### 8. Финальная проверка:
- Откройте http://localhost:3000
- Откройте http://localhost:8001/docs (Swagger)
- Создайте тестового пользователя через Swagger
- Попробуйте войти на фронтенде

---

## 📞 Все еще не работает?

### Соберите информацию для диагностики:

```bash
# 1. Версии софта
python --version > debug.txt
node --version >> debug.txt
yarn --version >> debug.txt

# 2. Статус MongoDB
mongosh --eval "db.version()" >> debug.txt

# 3. Backend логи
cd backend
uvicorn server:app 2>&1 | tee -a debug.txt

# 4. Frontend логи
cd ../frontend
yarn start 2>&1 | tee -a debug.txt

# Отправьте файл debug.txt для анализа
```

### Проверочный список:
- [ ] Python 3.11+ установлен
- [ ] Node.js 18+ установлен
- [ ] MongoDB запущен и доступен
- [ ] backend/requirements.txt установлен
- [ ] frontend/node_modules существует
- [ ] backend/.env файл существует и заполнен
- [ ] frontend/.env файл существует и заполнен
- [ ] Backend запущен на порту 8001
- [ ] Frontend запущен на порту 3000
- [ ] http://localhost:8001/api/health возвращает healthy
- [ ] http://localhost:3000 открывается в браузере

---

## 💡 Советы

1. **Всегда используйте виртуальное окружение для Python**
2. **Не запускайте backend с sudo**
3. **Проверяйте логи в терминале**
4. **Используйте Swagger UI для тестирования API**
5. **Если что-то не работает - перезапустите с чистого листа**

---

**Удачи в запуске! 🚀**
