import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { tasksApi } from "../lib/api";

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  // ─── Data state ───────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [stats, setStats] = useState({
    status: { all: 0, pending: 0, completed: 0 },
    category: { work: 0, personal: 0, appointment: 0, meeting: 0, other: 0 },
    priority: { low: 0, medium: 0, high: 0 },
  });

  // ─── Async status ─────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState("");

  // ─── Filter state ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // ─── Data fetching ────────────────────────────────────────────────────────
  const fetchTasks = useCallback(
    async (page = pagination.page) => {
      setLoading(true);
      setError("");

      try {
        const data = await tasksApi.list({
          search,
          status,
          page,
          limit: 6,
          category,
          priority,
        });

        setTasks(data.tasks);
        setPagination(data.pagination);
        if (data.stats) {
          setStats(data.stats);
        }
      } catch (apiError) {
        setError(apiError.message);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, search, status, category, priority],
  );

  // Debounced re-fetch on filter change
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      fetchTasks(1);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [search, status, category, priority]);

  // Keyboard (Escape) + body scroll lock
  useEffect(() => {
    if (!isTaskDialogOpen && !isTaskDetailOpen && !isSidebarOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving && isTaskDialogOpen) {
        setEditingTask(null);
        setIsTaskDialogOpen(false);
      }

      if (
        event.key === "Escape" &&
        !saving &&
        !isTaskDialogOpen &&
        isTaskDetailOpen
      ) {
        setIsTaskDetailOpen(false);
        setSelectedTask(null);
      }

      if (
        event.key === "Escape" &&
        !saving &&
        !isTaskDialogOpen &&
        !isTaskDetailOpen
      ) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen, isTaskDialogOpen, isTaskDetailOpen, saving]);

  // ─── Task dialog actions ──────────────────────────────────────────────────
  const openAddTask = () => {
    setEditingTask(null);
    setIsTaskDialogOpen(true);
  };

  const closeTaskDialog = () => {
    if (saving) return;
    setEditingTask(null);
    setIsTaskDialogOpen(false);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };

  // ─── Task detail panel actions ────────────────────────────────────────────
  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const closeTaskDetails = () => {
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
  };

  // ─── CRUD actions ─────────────────────────────────────────────────────────
  const handleSaveTask = async (payload, files = []) => {
    setSaving(true);
    setError("");
    const wasEditing = Boolean(editingTask);

    try {
      if (editingTask) {
        const result = await tasksApi.update(editingTask._id, payload, files);
        setSelectedTask((current) =>
          current?._id === editingTask._id
            ? {
                ...current,
                ...payload,
                attachments: result.task?.attachments || current.attachments,
                updatedAt: new Date().toISOString(),
              }
            : current,
        );
        setEditingTask(null);
      } else {
        await tasksApi.create(payload, files);
      }

      await fetchTasks(wasEditing ? pagination.page : 1);
      setIsTaskDialogOpen(false);
      return true;
    } catch (apiError) {
      setError(apiError.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (task) => {
    setWorkingId(task._id);
    setError("");
    const nextStatus = task.status === "completed" ? "pending" : "completed";

    try {
      await tasksApi.update(task._id, { status: nextStatus });
      setSelectedTask((current) =>
        current?._id === task._id
          ? {
              ...current,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : current,
      );
      await fetchTasks(pagination.page);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setWorkingId("");
    }
  };

  const handleUpdatePriority = async (task, newPriority) => {
    setWorkingId(task._id);
    setError("");

    try {
      await tasksApi.update(task._id, { priority: newPriority });
      setSelectedTask((current) =>
        current?._id === task._id
          ? {
              ...current,
              priority: newPriority,
              updatedAt: new Date().toISOString(),
            }
          : current,
      );
      await fetchTasks(pagination.page);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setWorkingId("");
    }
  };

  const handleDelete = async (id) => {
    setWorkingId(id);
    setError("");

    try {
      await tasksApi.remove(id);
      if (selectedTask?._id === id) {
        closeTaskDetails();
      }
      const nextPage =
        tasks.length === 1 && pagination.page > 1
          ? pagination.page - 1
          : pagination.page;
      await fetchTasks(nextPage);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setWorkingId("");
    }
  };

  // ─── Context value ────────────────────────────────────────────────────────
  const value = useMemo(
    () => ({
      // Data
      tasks,
      pagination,
      stats,
      // Async status
      loading,
      saving,
      error,
      workingId,
      // Filters
      search,
      setSearch,
      status,
      setStatus,
      category,
      setCategory,
      priority,
      setPriority,
      // Sidebar
      isSidebarOpen,
      setIsSidebarOpen,
      // Task dialog
      isTaskDialogOpen,
      editingTask,
      onAddTask: openAddTask,
      closeTaskDialog,
      onEdit: openEditTask,
      handleSaveTask,
      // Task detail panel
      isTaskDetailOpen,
      selectedTask,
      openTaskDetails,
      closeTaskDetails,
      // CRUD
      onToggle: handleToggle,
      onDelete: handleDelete,
      onUpdatePriority: handleUpdatePriority,
      // Pagination
      fetchTasks,
    }),
    [
      tasks,
      pagination,
      stats,
      loading,
      saving,
      error,
      workingId,
      search,
      status,
      category,
      priority,
      isSidebarOpen,
      isTaskDialogOpen,
      editingTask,
      isTaskDetailOpen,
      selectedTask,
    ],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }

  return context;
};
