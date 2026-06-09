import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  Eye,
  Expand,
  FileText,
  MessageSquare,
  Minimize2,
  MoreVertical,
  Paperclip,
  Pencil,
  Send,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { commentsApi, getUploadUrl } from "../../lib/api";
import { useTaskContext } from "../../context/TaskContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const softSpring = {
  type: "spring",
  stiffness: 280,
  damping: 28,
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

/* ─── Formatting helpers ─── */

const formatDate = (value) => {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatRelativeTime = (value) => {
  if (!value) return "";
  const now = new Date();
  const date = new Date(value);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just Now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};


const ViewTask = ({ task, isOpen, onClose }) => {
  // Internal state — fully owned by this component
  const [isExpanded, setIsExpanded] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const commentInputRef = useRef(null);

  // MoreVertical dropdown and attachments state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Shared task actions from context — no prop drilling
  const { workingId, onToggle, onDelete, onEdit, onUpdatePriority } =
    useTaskContext();

  /* ─── Comments ─── */

  const fetchComments = useCallback(async (taskId) => {
    setLoadingComments(true);
    try {
      const data = await commentsApi.list(taskId);
      setComments(data.comments || []);
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  useEffect(() => {
    if (task?._id && isOpen) {
      fetchComments(task._id);
    } else {
      setComments([]);
      setCommentText("");
      setSelectedFiles([]);
      setIsMenuOpen(false);
    }
  }, [task?._id, isOpen, fetchComments]);

  // Reset expand when panel closes
  useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (selectedFiles.length + files.length > 3) {
        alert("You can attach a maximum of 3 files per comment.");
        return;
      }
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddComment = async () => {
    if (
      (!commentText.trim() && selectedFiles.length === 0) ||
      !task?._id ||
      addingComment
    )
      return;

    setAddingComment(true);
    try {
      const data = await commentsApi.add(
        task._id,
        commentText.trim(),
        selectedFiles,
      );
      setComments((prev) => [data.comment, ...prev]);
      setCommentText("");
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      commentInputRef.current?.focus();
    } catch {
      // silent fail
    } finally {
      setAddingComment(false);
    }
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  /* ─── Share & Expand ─── */

  const handleShare = () => {
    const url = `${window.location.origin}/task/${task?._id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    });
  };

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleClose = () => {
    setIsExpanded(false);
    onClose();
  };

  if (!isOpen || !task) return null;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 flex justify-end backdrop-blur-sm"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}>
      <motion.aside
        animate={{ x: 0 }}
        aria-labelledby="task-detail-title"
        aria-modal="true"
        className={`flex h-full flex-col overflow-hidden border-l bg-background shadow-2xl transition-all duration-300 ease-out ${
          isExpanded
            ? "w-full max-w-full rounded-none"
            : "w-full rounded-l-xl sm:max-w-xl"
        }`}
        exit={{ x: "100%" }}
        initial={{ x: "100%" }}
        role="dialog"
        transition={softSpring}>
        {/* ─── Header Bar ─── */}
        <div className="flex h-14 items-center justify-between border-b bg-muted/30 px-4">
          <div className="flex items-center gap-1">
            <Button
              aria-label="Share task"
              className="relative"
              size="icon"
              type="button"
              variant="ghost"
              onClick={handleShare}>
              <Share2 size={16} />
              <AnimatePresence>
                {shareToast && (
                  <motion.span
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background shadow-lg"
                    exit={{ opacity: 0, y: 4 }}
                    initial={{ opacity: 0, y: 4 }}>
                    Copied!
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
            <Button
              aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
              size="icon"
              className={"hidden sm:block"}
              type="button"
              variant="ghost"
              onClick={toggleExpand}>
              {isExpanded ? <Minimize2 size={16} /> : <Expand size={16} />}
            </Button>
            <div className="relative">
              <Button
                aria-label="More task actions"
                size="icon"
                type="button"
                variant="ghost"
                onClick={() => setIsMenuOpen((prev) => !prev)}>
                <MoreVertical size={16} />
              </Button>
              <AnimatePresence>
                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-50"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <motion.div
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute left-0 w-44 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg focus:outline-none z-[60]"
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}>
                      <button
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
                        disabled={workingId === task._id}
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onToggle(task);
                        }}>
                        <CheckCircle2 size={14} />
                        <span>
                          {task.status === "completed"
                            ? "Mark pending"
                            : "Mark done"}
                        </span>
                      </button>
                      <button
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
                        disabled={workingId === task._id}
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onEdit(task);
                        }}>
                        <Pencil size={14} />
                        <span>Edit</span>
                      </button>
                      <div className="my-1 border-t border-border" />
                      <button
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                        disabled={workingId === task._id}
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onDelete(task._id);
                          handleClose();
                        }}>
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <Button
            aria-label="Close task details"
            size="icon"
            type="button"
            variant="ghost"
            onClick={handleClose}>
            <X />
          </Button>
        </div>
        

        {/* ─── Scrollable Content ─── */}
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none">
          <div className={`px-5 py-7 ${isExpanded ? "mx-auto max-w-3xl" : ""}`}>
            <motion.div
              animate="visible"
              className="space-y-7"
              initial="hidden"
              transition={{ staggerChildren: 0.05 }}>
              {/* Title & Badge */}
              <motion.div className="space-y-2" variants={fadeUp}>
                <Badge className="w-fit" variant="outline">
                  Task details
                </Badge>
                <h2
                  className="wrap-break-word text-2xl font-semibold tracking-normal text-foreground"
                  id="task-detail-title">
                  {task.title}
                </h2>
              </motion.div>

              {/* Metadata Grid */}
              <motion.div
                className="grid grid-cols-2 gap-y-4 gap-x-6 sm:grid-cols-3 border-y border-border/50 py-4 text-xs text-muted-foreground"
                variants={fadeUp}>
                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground/75">
                    Status
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      className="h-5 px-1.5 text-[10px]"
                      variant={
                        task.status === "completed" ? "secondary" : "outline"
                      }>
                      {task.status === "completed" ? "Done" : "Pending"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground/75">
                    Category
                  </span>
                  <div className="capitalize font-semibold text-foreground text-sm">
                    {task.category || "other"}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground/75">
                    Priority
                  </span>
                  <div className="flex items-center">
                    <Select
                      value={task.priority || "medium"}
                      onValueChange={(val) => onUpdatePriority(task, val)}
                      disabled={workingId === task._id}>
                      <SelectTrigger className="h-6 rounded-md border border-input bg-transparent px-2 text-xs font-semibold hover:bg-muted capitalize data-[placeholder]:text-muted-foreground w-24">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground/75">
                    Created
                  </span>
                  <div className="font-medium text-foreground text-xs leading-none">
                    {formatDate(task.createdAt)}
                  </div>
                </div>

                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <span className="font-medium text-muted-foreground/75">
                    Updated
                  </span>
                  <div className="font-medium text-foreground text-xs leading-none">
                    {formatDate(task.updatedAt)}
                  </div>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                className="rounded-lg border bg-muted/30 p-5"
                variants={fadeUp}>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <FileText size={16} />
                  Description
                </div>
                <p className="wrap-break-word text-sm leading-6 text-muted-foreground">
                  {task.description || "No description added yet."}
                </p>
              </motion.div>

              {/* Attachments */}
              {task.attachments && task.attachments.length > 0 && (
                <motion.div variants={fadeUp}>
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <Paperclip size={16} />
                    Attachments
                  </div>
                  <div className="space-y-2">
                    {task.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3 transition-colors duration-150 hover:bg-muted/40 hover:border-primary/30">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-600/10">
                          <Paperclip className="text-orange-600" size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {att.originalName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(att.size)}
                            {att.uploadedAt &&
                              ` · ${formatRelativeTime(att.uploadedAt)}`}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <a
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-orange-600 transition-colors duration-150 hover:bg-orange-600/10"
                            href={getUploadUrl(att.fileName)}
                            rel="noopener noreferrer"
                            target="_blank">
                            <Eye size={12} />
                            <span className="hidden sm:block">View</span>
                          </a>
                          <a
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-orange-600 transition-colors duration-150 hover:bg-orange-600/10"
                            download={att.originalName}
                            href={getUploadUrl(att.fileName)}>
                            <Download size={12} />
                            <span className="hidden sm:block">Download</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Comments Section */}
              <motion.div className="space-y-4" variants={fadeUp}>
                <div className="flex items-center gap-3 border-b pb-2">
                  <button
                    className="relative flex items-center gap-1.5 pb-2 text-sm font-semibold text-foreground border-b-2 border-foreground transition-colors duration-150"
                    type="button">
                    <MessageSquare size={14} />
                    Comments
                    {comments.length > 0 && (
                      <span className="ml-1 rounded-full bg-orange-600/10 px-1.5 py-0.5 text-[10px] font-bold text-orange-600">
                        {comments.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-0">
                  {loadingComments ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      Loading comments...
                    </p>
                  ) : comments.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      No comments yet. Be the first to add one!
                    </p>
                  ) : (
                    <AnimatePresence>
                      {comments.map((comment) => (
                        <motion.div
                          key={comment._id}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3 border-b border-border/50 py-2.5 last:border-b-0 transition-colors duration-100 hover:bg-muted/30 hover:rounded-lg hover:px-2"
                          exit={{ opacity: 0, y: -8 }}
                          initial={{ opacity: 0, y: 8 }}
                          layout>
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white shadow-sm">
                            {(comment.userId?.name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-0.5 flex items-center gap-2">
                              <span className="text-sm font-semibold">
                                {comment.userId?.name || "Unknown"}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {formatRelativeTime(comment.createdAt)}
                              </span>
                            </div>
                            {comment.text && (
                              <p className="wrap-break-word text-sm leading-relaxed text-muted-foreground">
                                {comment.text}
                              </p>
                            )}
                            {comment.attachments &&
                              comment.attachments.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {comment.attachments.map((att, idx) => (
                                    <a
                                      key={idx}
                                      href={getUploadUrl(att.fileName)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150">
                                      <Paperclip
                                        size={12}
                                        className="shrink-0"
                                      />
                                      <span className="max-w-30 truncate">
                                        {att.originalName}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground/50">
                                        ({formatFileSize(att.size)})
                                      </span>
                                    </a>
                                  ))}
                                </div>
                              )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* ─── Sticky Comment Input ─── */}
        <div
          className={`shrink-0 border-t bg-background px-4 py-3 ${isExpanded ? "mx-auto w-full max-w-3xl" : ""}`}>
          {/* Selected files preview */}
          {selectedFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2 px-1">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
                  <Paperclip size={12} />
                  <span className="max-w-30 truncate">{file.name}</span>
                  <span className="text-[10px] text-muted-foreground/70">
                    ({formatFileSize(file.size)})
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(idx)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-destructive transition-colors duration-150">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 rounded-lg border bg-muted/20 p-2 transition-all duration-150 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={addingComment}
            />
            <Button
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              disabled={addingComment}
              onClick={() => fileInputRef.current?.click()}
              size="icon"
              type="button"
              variant="ghost">
              <Paperclip size={15} />
            </Button>
            <input
              ref={commentInputRef}
              className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground/50"
              disabled={addingComment}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleCommentKeyDown}
              placeholder="Add a comment..."
              type="text"
              value={commentText}
            />
            <Button
              className={`h-8 w-8 shrink-0 ${
                (!commentText.trim() && selectedFiles.length === 0) ||
                addingComment
                  ? "text-muted-foreground"
                  : "bg-orange-600 hover:bg-orange-700 text-white border-none"
              }`}
              disabled={
                (!commentText.trim() && selectedFiles.length === 0) ||
                addingComment
              }
              onClick={handleAddComment}
              size="icon"
              type="button"
              variant={
                (!commentText.trim() && selectedFiles.length === 0) ||
                addingComment
                  ? "ghost"
                  : "default"
              }>
              <Send size={15} />
            </Button>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
};

export default ViewTask;
