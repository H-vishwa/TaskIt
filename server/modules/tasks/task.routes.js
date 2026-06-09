import express from "express";
import protect from "../auth/auth.middleware.js";
import upload from "../../config/multer.js";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "./task.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getTasks);
router.post("/", upload.array("attachments", 5), createTask);
router.put("/:id", upload.array("attachments", 5), updateTask);
router.delete("/:id", deleteTask);

export default router;
