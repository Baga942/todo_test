1. Запуск backend

Перейти в папку backend:
cd backend

Установить зависимости:
pip install -r requirements.txt

Запустить сервер:
uvicorn main:app --reload

Backend будет доступен по адресу:
http://localhost:8000/docs

2. Запуск frontend

Перейти в папку frontend:
cd frontend

Установить зависимости:
npm install

Запустить проект:
npm run dev

Frontend будет доступен по адресу:
http://localhost:3000

3. Примеры запросов

Регистрация:
POST http://localhost:8000/register
Тело:
{
  "username": "newuser",
  "password": "newpassword"
}

Логин:
POST http://localhost:8000/token
Content-Type: application/x-www-form-urlencoded
Тело:
username=newuser&password=newpassword

Ответ:
{
  "access_token": "твой_токен",
  "token_type": "bearer"
}

Получить задачи:
GET http://localhost:8000/tasks
Заголовок:
Authorization: Bearer {access_token}

Создать задачу:
POST http://localhost:8000/tasks
Заголовок:
Authorization: Bearer {access_token}
Тело:
{
  "title": "Новая задача",
  "description": "Описание задачи"
}

Обновить задачу:
PUT http://localhost:8000/tasks/{task_id}
Заголовок:
Authorization: Bearer {access_token}
Тело:
{
  "title": "Обновленный заголовок",
  "description": "Новое описание"
}

Удалить задачу:
DELETE http://localhost:8000/tasks/{task_id}
Заголовок:
Authorization: Bearer {access_token}

Выход:
На фронтенде удалить токен и перенаправить на страницу логина.
