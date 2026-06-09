import Comment from "./comment.model.js";
import Task from "../tasks/task.model.js";

export const getComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Verify task exists and belongs to the authenticated user (prevents IDOR)
    const task = await Task.findOne({ _id: taskId, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comments = await Comment.find({ taskId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .lean();

    res.json({ comments });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text = "" } = req.body;

    // Verify task exists and belongs to the authenticated user (prevents IDOR)
    const task = await Task.findOne({ _id: taskId, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const attachments = (req.files || []).map((file) => ({
      originalName: file.originalname,
      fileName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
    }));

    if (!text?.trim() && attachments.length === 0) {
      return res
        .status(400)
        .json({ message: "Comment text or attachment is required" });
    }

    const comment = await Comment.create({
      taskId,
      userId: req.user._id,
      text: text.trim(),
      attachments,
    });

    const populated = await Comment.findById(comment._id)
      .populate("userId", "name email")
      .lean();

    res.status(201).json({ comment: populated });
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};

