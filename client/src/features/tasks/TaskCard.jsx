import { useState, useRef, useEffect } from "react";
import {
  CheckCircle,
  Circle,
  Clock,
  Eye,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Pencil,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { useTaskContext } from "../../context/TaskContext";

const getDurationLeft = (dueDate) => {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);

  const date1 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const date2 = Date.UTC(due.getFullYear(), due.getMonth(), due.getDate());
  const diffMs = date2 - date1;
  const diffDays = Math.ceil(diffMs / 86400000);

  if (diffDays < 0) return `${Math.abs(diffDays)}d Overdue`;
  if (diffDays === 0) return "Due Today";
  if (diffDays === 1) return "1 Day left";
  return `${diffDays} Days left`;
};

const taskVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, x: -18, scale: 0.98 },
};

const TaskCard = ({ task }) => {
  const { workingId, onToggle, onDelete, onEdit, openTaskDetails } =
    useTaskContext();
  const completed = task.status === "completed";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.div
      layout
      exit="exit"
      transition={{ duration: 0.2, ease: "easeOut" }}
      variants={taskVariants}
      whileHover={{ y: -2 }}
      style={{ zIndex: menuOpen ? 50 : 1 }}>
      <Card onClick={() => openTaskDetails(task)} className="relative transition hover:border-orange-700/60 rounded-md py-3 cursor-pointer">
        <CardContent className="px-3 sm:p-6 ">
          <div className="absolute right-2 top-1/2 -translate-y-1/2 sm:hidden" ref={menuRef}>
            <Button
              aria-label="More options"
              size="icon"
              type="button"
              variant="ghost"
              className="border-none shadow-none p-0 hover:bg-transparent dark:hover:bg-transparent"
              disabled={workingId === task._id}
              onClick={() => setMenuOpen((prev) => !prev)}>
              <MoreVertical size={13}/>
            </Button>

            {menuOpen && (
              <div className="absolute right-3 top-3 z-[500] min-w-35 rounded-md border bg-popover shadow-md py-1">
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => {
                    openTaskDetails(task);
                    setMenuOpen(false);
                  }}>
                  <Eye size={15} /> View
                </button>
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => {
                    onEdit(task);
                    setMenuOpen(false);
                  }}>
                  <Pencil size={15} /> Edit
                </button>
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    onDelete(task._id);
                    setMenuOpen(false);
                  }}>
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            )}
          </div>
          <div className="flex sm:items-start sm:justify-between gap-3 sm:gap-4 cursor-pointer">
              <motion.button
                aria-label={
                  completed ? "Mark task pending" : "Mark task complete"
                }
                className="mt-0 sm:mt-0.5 shrink-0 rounded-full text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={workingId === task._id}
                onClick={() => onToggle(task)}
                type="button"
                whileTap={{ scale: 0.88 }}>
                {completed ? (
                  <CheckCircle className="text-emerald-600" size={20} />
                ) : (
                  <Circle className="text-zinc-400" size={20} />
                )}
              </motion.button>
            <div className="flex min-w-0 flex-1 items-center sm:items-start gap-3">

              <button
                className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                
                type="button">
                <div className="mr-4 mb-0 sm:mb-1.5 flex justify-between sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                  <span
                    className={`block truncate max-w-[12ch] sm:overflow-visible sm:whitespace-normal sm:max-w-none text-sm font-semibold ${
                      completed ? "text-muted-foreground" : "text-foreground"
                    }`}
                    title={task.title}>
                    {task.title}
                  </span>
                  {task.priority && (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize border-none ${
                        task.priority === "high"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                          : task.priority === "medium"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800/30 dark:text-slate-400"
                      }`}>
                      <span className="sm:hidden">
                        {task.priority === "high" ? "High" : task.priority === "medium" ? "Med" : "Low"}
                      </span>
                      <span className="hidden sm:inline">
                        {task.priority} Priority
                      </span>
                    </span>
                  )}
                </div>

                <p className="hidden md:block  line-clamp-2 wrap-break-word text-xs leading-5 text-muted-foreground">
                  {task.description || "No description added yet."}
                </p>

                <div className="hidden md:flex mt-2.5 flex-wrap items-center gap-4 text-xs text-muted-foreground/80 font-medium">
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Clock size={13} />
                      <span>{getDurationLeft(task.dueDate)}</span>
                    </div>
                  )}
                  {task.attachments && task.attachments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Paperclip size={13} />
                      <span>{task.attachments.length}</span>
                    </div>
                  )}
                  {task.commentCount !== undefined && task.commentCount > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare size={13} />
                      <span>{task.commentCount}</span>
                    </div>
                  )}
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2 mt-2 justify-end sm:mt-0 sm:shrink-0">
              {/* Desktop: original 3 buttons */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  aria-label="Edit task"
                  disabled={workingId === task._id}
                  size="icon"
                  type="button"
                  variant="outline"
                  onClick={() => onEdit(task)}>
                  <Pencil />
                </Button>
                <Button
                  aria-label="Delete task"
                  disabled={workingId === task._id}
                  size="icon"
                  type="button"
                  className="transition duration-300 hover:bg-destructive/15 hover:text-destructive hover:border-destructive dark:hover:bg-destructive/5"
                  variant="outline"
                  onClick={() => onDelete(task._id)}>
                  <Trash2 />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TaskCard;
