Team Task Manager (Full-Stack)

A full-stack web application where users can create projects, assign tasks, and track progress with role-based access control (Admin/Member).


Live Demo
 Frontend: https://welcoming-warmth-production-de38.up.railway.app
 Backend API: https://taskmanager-production-3b04.up.railway.app

--

 Features

Authentication
- User Signup & Login
- JWT-based authentication
- Role-based access (Admin / Member)
  
Project Management
- Admin can create projects
- Add members to projects
- View all project

Task Management
- Create tasks under projects
- Assign tasks to members
- Update task status:
  - Pending
  - In Progress
  - Completed

 Dashboard
- Total tasks
- Pending tasks
- In-progress tasks
- Completed tasks
- Overdue tasks

---

Tech Stack

 Frontend
- React (Vite)
- Axios
- React Router

 Backend
- Node.js
- Express.js
- Prisma ORM

 Database
- PostgreSQL (Railway)

 Deployment
- Railway (Frontend + Backend)

---

Project Structure
│
├── backend/
│ ├── prisma/
│ ├── src/
│ │ ├── controllers/
│ │ ├── routes/
│ │ ├── middleware/
│ │ └── server.js
│ └── package.json
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ └── App.jsx
│ └── package.json

          
  Roles & Permissions

| Role   | Permissions |
|--------|------------|
| Admin  | Create project, add members, create & assign tasks |
| Member | View assigned tasks, update task status |



API Endpoints

 Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`

Projects
- `GET /api/projects`
- `POST /api/projects`
- `POST /api/projects/:projectId/members`

Tasks
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:taskId/status`

Dashboard
- `GET /api/dashboard`

---




