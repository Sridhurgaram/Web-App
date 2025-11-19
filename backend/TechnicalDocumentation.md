# Crypto Dashboard - Technical Documentation

## Project Overview

This project is a **full-stack web application** for managing tasks with authentication.  
**Tech Stack:**

- **Frontend:** React.js, TailwindCSS  
- **Backend:** Node.js, Express.js, MongoDB  
- **Authentication:** JWT (JSON Web Tokens)  
- **Database:** MongoDB (Atlas/local)  

**Features:**

- User registration and login with JWT authentication  
- Protected dashboard accessible only after login  
- CRUD operations on tasks (Create, Read, Update, Delete)  
- Logout and session handling  
- Scalable and modular code structure  

---

## Environment Setup

**Backend `.env` file:**

PORT=5000
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>



**Frontend:**

- Base URL: `http://localhost:5000/api`  
- Axios instance automatically includes JWT from `localStorage`  

---

## Backend API Endpoints

### 1. User Authentication

#### Register

- **Method:** POST  
- **URL:** `/api/auth/register`  
- **Headers:**
Content-Type: application/json

- **Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
Response (201/200):

json
{
  "_id": "691d4d0b5027df35b5ab2fec",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2b$10$hashedpassword",
  "__v": 0
}


Login
Method: POST
URL: /api/auth/login
Headers:
Content-Type: application/json
Body (JSON):
{
  "email": "john@example.com",
  "password": "123456"
}
Response (200):

{
  "token": "<jwt_token>",
  "user": {
    "_id": "691d4d0b5027df35b5ab2fec",
    "name": "John Doe",
    "email": "john@example.com"
  }
}


2. Tasks CRUD
All task endpoints require JWT token in header:
Authorization: Bearer <jwt_token>

Get All Tasks
Method: GET
URL: /api/tasks
Headers:
Authorization: Bearer <jwt_token>
Response (200):

[
  {
    "_id": "691d50a05027df35b5ab2ff1",
    "title": "My first task",
    "description": "Test task",
    "userId": "691d4d0b5027df35b5ab2fec",
    "createdAt": "2025-11-19T05:07:44.600Z",
    "updatedAt": "2025-11-19T05:07:44.600Z",
    "__v": 0
  }
]


Create Task
Method: POST

URL: /api/tasks

Headers:
Authorization: Bearer <jwt_token>
Content-Type: application/json
{
  "title": "hello",
  "description": "helo",
  "assignee": "Charlie",
  "estimatedHours": 2,
  "priority": "High"
}

Response (200):

{
  "_id": "691d9c6b8c21734a14b74483",
  "title": "hello",
  "description": "helo",
  "assignee": "Charlie",
  "estimatedHours": 2,
  "priority": "High",
  "userId": "691d7232fe54de8420f96579",
  "createdAt": "2025-11-19T10:31:07.546Z",
  "updatedAt": "2025-11-19T10:31:07.546Z",
  "__v": 0
}


Update Task
Method: PUT

URL: /api/tasks/<task_id>

Headers:
Authorization: Bearer <jwt_token>
Content-Type: application/json
Body (JSON):
{
  "title": "Updated Task",
  "description": "Updated description",
  "assignee": "Charlie",
  "estimatedHours": 3,
  "priority": "High"
}

Response (200):

{
  "_id": "691d9c6b8c21734a14b74483",
  "title": "Updated Task",
  "description": "Updated description",
  "assignee": "Charlie",
  "estimatedHours": 3,
  "priority": "High",
  "userId": "691d7232fe54de8420f96579",
  "createdAt": "2025-11-19T10:31:07.546+00:00",
  "updatedAt": "2025-11-19T10:45:00.000+00:00",
  "__v": 0
}


Delete Task
Method: DELETE

URL: /api/tasks/<task_id>

Headers:
Authorization: Bearer <jwt_token>
Response (200):
{
  "msg": "Task deleted"
}


Frontend Notes
Routing: React Router DOM

/login → Login page

/register → Register page

/dashboard → Protected dashboard

JWT Handling: stored in localStorage and attached automatically to Axios requests.

Task Dashboard Features:

List all tasks

Create a new task

Update existing tasks

Delete tasks

Logout clears JWT

Styling: TailwindCSS, responsive layout

Scaling Notes
Backend:

Routes are modular (routes/auth.js, routes/tasks.js)

JWT middleware protects routes

MongoDB Atlas can scale horizontally

Frontend:

Components are reusable (TaskForm.jsx, Dashboard.jsx)

Axios interceptors handle authentication globally

Can easily add search, filters, or pagination