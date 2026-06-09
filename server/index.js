import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDb from "./config/connectDb.js";
import authRoutes from "./modules/auth/auth.routes.js";
import taskRoutes from "./modules/tasks/task.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import commentRoutes from "./modules/comments/comment.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8000; // Match port from server env file (8000) or default to 8000

// Helmet configuration with cross-origin resource policy enabled for uploads
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Rate limiting for auth routes to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login/registration attempts, please try again after 15 minutes",
  },
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "TaskIt API is running" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/tasks/:taskId/comments", commentRoutes);
app.use("/api/users", userRoutes);

// Global Error Handler Middleware (handles validation, multer, and other server-side errors)
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(err.status || 400).json({
    message: err.message || "An unexpected error occurred",
  });
});

app.listen(port, () => {
  console.log(`TaskIt API listening on port ${port}`);
  connectDb();
});

