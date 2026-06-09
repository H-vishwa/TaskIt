# TaskIt 📋

> A full-stack MERN task management application with JWT authentication, real-time task CRUD, comments, file uploads, search, filtering, and pagination.

---

## 🚀 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite 8 | Build Tool & Dev Server |
| Tailwind CSS v4 | Styling |
| shadcn/ui + Radix UI | Component Library |
| React Redux | State Management |
| Motion (Framer) | Animations |
| Lucide React + Phosphor Icons | Icons |
| date-fns | Date Utilities |
| react-day-picker | Date Picker |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express 5 | Server Framework |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Tokens (JWT) | Authentication |
| Multer | File Uploads |
| Helmet | Security Headers |
| express-rate-limit | Rate Limiting |
| cookie-parser | Cookie Handling |
| dotenv | Environment Variables |
| nodemon | Dev Auto-Reload |

---

## 📁 Project Structure

```
TaskIt/
├── client/                        # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/                # Static assets
│   │   ├── components/            # Shared/reusable UI components
│   │   ├── context/               # React context providers
│   │   ├── features/
│   │   │   ├── auth/              # Login, Register pages & auth logic
│   │   │   ├── dashboard/         # Main dashboard view
│   │   │   └── tasks/             # Task list, detail, create/edit
│   │   ├── lib/                   # Utilities & API helpers
│   │   ├── App.jsx                # Root component & routing
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Global styles
│   ├── .env                       # Frontend environment variables
│   ├── vite.config.js
│   └── package.json
│
└── server/                        # Express backend (Node.js)
    ├── config/
    │   └── connectDb.js           # MongoDB connection
    ├── modules/
    │   ├── auth/                  # Auth routes, controller, middleware
    │   ├── tasks/                 # Task routes, controller, model
    │   ├── users/                 # User routes, controller, model
    │   └── comments/              # Comment routes, controller, model
    ├── utils/                     # Helper functions & middlewares
    ├── uploads/                   # Uploaded files (gitignored)
    ├── .env                       # Backend environment variables
    ├── index.js                   # Express app entry point
    └── package.json
```

---

## ⚙️ Prerequisites

Make sure you have the following installed before running the project:

- **Node.js** v18 or higher → [Download](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- **MongoDB** — either:
  - A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (recommended), or
  - A local MongoDB instance running on `mongodb://localhost:27017`
- **Git** → [Download](https://git-scm.com)

---

## 🛠️ Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/TaskIt.git
cd TaskIt
```

---

### 2. Backend Setup

#### Navigate to the server directory

```bash
cd server
```

#### Install dependencies

```bash
npm install
```

#### Create the environment file

Create a `.env` file inside the `server/` directory:

```bash
# server/.env

PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret_key
```

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the Express server listens on | `8000` |
| `MONGO_URI` | MongoDB connection string (Atlas or local) | `mongodb+srv://user:pass@cluster.mongodb.net/taskit` |
| `JWT_SECRET` | Secret key used to sign/verify JWTs — use a long random string | `my_super_secret_key_123` |

> **Tip:** Generate a secure JWT secret with Node.js:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

#### Start the development server

```bash
npm run dev
```

The backend will start on **http://localhost:8000**

---

### 3. Frontend Setup

#### Open a new terminal and navigate to the client directory

```bash
cd client
```

#### Install dependencies

```bash
npm install
```

#### Create the environment file (optional)

Create a `.env` file inside the `client/` directory:

```bash
# client/.env

VITE_API_URL=http://localhost:8000/api
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:8000/api` |

#### Start the development server

```bash
npm run dev
```

The frontend will start on **http://localhost:5173**

---

### 4. Running Both Servers

You need **two terminal windows** open simultaneously:

| Terminal | Command | URL |
|----------|---------|-----|
| Terminal 1 (Backend) | `cd server && npm run dev` | http://localhost:8000 |
| Terminal 2 (Frontend) | `cd client && npm run dev` | http://localhost:5173 |

---

## 🔌 API Routes

All API routes are prefixed with `/api`.

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login and receive JWT | ❌ |
| `GET` | `/api/auth/me` | Get current authenticated user | ✅ |

### Task Routes — `/api/tasks`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/tasks` | Get all tasks (with search, filter, pagination) | ✅ |
| `POST` | `/api/tasks` | Create a new task | ✅ |
| `PUT` | `/api/tasks/:id` | Update a task | ✅ |
| `DELETE` | `/api/tasks/:id` | Delete a task | ✅ |

### Comment Routes — `/api/tasks/:taskId/comments`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/tasks/:taskId/comments` | Get comments for a task | ✅ |
| `POST` | `/api/tasks/:taskId/comments` | Add a comment to a task | ✅ |
| `DELETE` | `/api/tasks/:taskId/comments/:commentId` | Delete a comment | ✅ |

### User Routes — `/api/users`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/users` | Get all users | ✅ |
| `PUT` | `/api/users/:id` | Update user profile | ✅ |

> **Note:** Protected routes require a valid JWT token sent via `Authorization: Bearer <token>` header or as an HTTP-only cookie.

---

## ✨ Features

- 🔐 **Authentication** — Secure user registration and login with JWT
- 🛡️ **Rate Limiting** — Auth routes are limited to 100 requests per 15 minutes per IP
- 📝 **Task CRUD** — Create, read, update, and delete tasks
- ✅ **Status Toggle** — Mark tasks as pending or completed
- 💬 **Comments** — Add and manage comments on tasks
- 📎 **File Uploads** — Attach files to tasks via Multer
- 🔍 **Search & Filter** — Search tasks by keyword, filter by status/priority
- 📄 **Pagination** — Dashboard with paginated task lists
- 🎨 **Responsive UI** — Built with React 19, Tailwind CSS v4, and shadcn/ui components
- 🔒 **Security** — Helmet middleware for secure HTTP headers

---

## 📦 Available Scripts

### Server (`/server`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with nodemon (auto-reload) |

### Client (`/client`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 🔧 Troubleshooting

### CORS Error
Make sure the backend's CORS origin matches your frontend URL. In `server/index.js`:
```js
cors({ origin: "http://localhost:5173", credentials: true })
```
If your frontend runs on a different port, update this value accordingly.

### MongoDB Connection Fails
- Check that your `MONGO_URI` in `server/.env` is correct.
- If using Atlas, ensure your IP address is whitelisted in the Atlas Network Access settings.
- If using a local MongoDB, make sure the MongoDB service is running.

### Port Already in Use
Change the `PORT` value in `server/.env` and update `VITE_API_URL` in `client/.env` to match.

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👤 Author

**Himanshu Kumar** — Built with ❤️ using the MERN stack.
