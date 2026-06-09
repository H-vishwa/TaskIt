import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Task from "./task.model.js";
import Comment from "../comments/comment.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "..", "uploads");

const buildTaskQuery = (userId, search, status, category, priority) => {
  const query = { userId };

  if (status && status !== "all") {
    query.status = status;
  }

  if (category && category !== "all") {
    query.category = category;
  }

  if (priority && priority !== "all") {
    query.priority = priority;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  return query;
};

export const getTasks = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 50);
    const skip = (page - 1) * limit;
    const { search = "", status = "all", category = "all", priority = "all" } = req.query;
    const query = buildTaskQuery(req.user._id, search, status, category, priority);

    const [tasksRaw, total, allUserTasks] = await Promise.all([
      Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Task.countDocuments(query),
      Task.find({ userId: req.user._id }).select("status category priority").lean(),
    ]);

    const tasks = await Promise.all(
      tasksRaw.map(async (t) => {
        const commentCount = await Comment.countDocuments({ taskId: t._id });
        return {
          ...t.toObject(),
          commentCount,
        };
      })
    );

    const categoryCounts = { work: 0, personal: 0, appointment: 0, meeting: 0, other: 0 };
    const priorityCounts = { low: 0, medium: 0, high: 0 };
    const statusCounts = { all: allUserTasks.length, pending: 0, completed: 0 };

    allUserTasks.forEach((t) => {
      if (t.status === "completed") statusCounts.completed++;
      else statusCounts.pending++;

      const cat = t.category || "other";
      if (categoryCounts[cat] !== undefined) {
        categoryCounts[cat]++;
      } else {
        categoryCounts.other++;
      }

      const prio = t.priority || "medium";
      if (priorityCounts[prio] !== undefined) {
        priorityCounts[prio]++;
      }
    });

    res.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
      stats: {
        status: statusCounts,
        category: categoryCounts,
        priority: priorityCounts,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description = "", category = "other", priority = "medium", dueDate = null } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    if (!["work", "personal", "appointment", "meeting", "other"].includes(category)) {
      return res.status(400).json({ message: "Invalid task category" });
    }

    if (!["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({ message: "Invalid task priority" });
    }

    const attachments = (req.files || []).map((file) => ({
      originalName: file.originalname,
      fileName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
    }));

    const task = await Task.create({
      title,
      description,
      category,
      priority,
      dueDate,
      attachments,
      userId: req.user._id,
    });

    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ message: "Failed to create task" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, status, category, priority, dueDate } = req.body;
    const updates = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: "Task title is required" });
      }
      updates.title = title;
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (status !== undefined) {
      if (!["pending", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid task status" });
      }
      updates.status = status;
    }

    if (category !== undefined) {
      if (!["work", "personal", "appointment", "meeting", "other"].includes(category)) {
        return res.status(400).json({ message: "Invalid task category" });
      }
      updates.category = category;
    }

    if (priority !== undefined) {
      if (!["low", "medium", "high"].includes(priority)) {
        return res.status(400).json({ message: "Invalid task priority" });
      }
      updates.priority = priority;
    }

    if (dueDate !== undefined) {
      updates.dueDate = dueDate ? new Date(dueDate) : null;
    }

    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map((file) => ({
        originalName: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
      }));

      const task = await Task.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (task) {
        updates.attachments = [...(task.attachments || []), ...newAttachments];
      }
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true },
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: "Failed to update task" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Delete all attachment files from disk to prevent orphaned file storage
    if (task.attachments && task.attachments.length > 0) {
      for (const attachment of task.attachments) {
        const filePath = path.join(uploadsDir, attachment.fileName);
        fs.unlink(filePath, (err) => {
          if (err && err.code !== "ENOENT") {
            console.error(`Failed to delete attachment file: ${filePath}`, err.message);
          }
        });
      }
    }

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task" });
  }
};
