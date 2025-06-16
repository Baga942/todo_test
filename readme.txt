1. Запуск backend

backend:
cd backend

Установить зависимости:
pip install -r requirements.txt

Запустить сервер:
uvicorn main:app --reload

http://localhost:8000/docs

2. Запуск frontend
cd frontend

Установить зависимости:
npm install

Запустить проект:
npm run dev

http://localhost:3000

3. Примеры запросов

Регистрация:
POST http://localhost:8000/register
{
  "username": "newuser",
  "password": "newpassword"
}

Логин:
POST http://localhost:8000/token

Получить задачи:
GET http://localhost:8000/tasks

Создать задачу:
POST http://localhost:8000/tasks


Обновить задачу:
PUT http://localhost:8000/tasks/{task_id}

Удалить задачу:
DELETE http://localhost:8000/tasks/{task_id}

Выход:
На фронтенде удалить токен и перенаправить на страницу логина.

Локальный запуск через Docker

1: Клонировать репозиторий
git clone https://github.com/Baga942/todo_test.git
cd todo_test

2: Запустить Docker контейнеры
docker-compose up --build

После запуска:
- Бэкенд доступен на: http://localhost:8000
- Фронтенд доступен на: http://localhost:3000




