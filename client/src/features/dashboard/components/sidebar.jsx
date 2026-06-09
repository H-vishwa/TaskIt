import {
  BarChart3,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Circle,
  FolderOpen,
  Flag,
  ListTodo,
  PanelLeftClose,
  User,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { useTaskContext } from "../../../context/TaskContext";

const softSpring = {
  type: "spring",
  stiffness: 280,
  damping: 28,
};

const Sidebar = () => {
  const {
    tasks,
    stats,
    status,
    setStatus,
    category,
    setCategory,
    priority,
    setPriority,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useTaskContext();

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const completionRate = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  const isOpen = isSidebarOpen;
  const onClose = () => setIsSidebarOpen(false);
  const statusLinks = [
    {
      icon: ListTodo,
      label: "All Tasks",
      value: "all",
      count: stats?.status?.all || 0,
    },
    {
      icon: Circle,
      label: "Pending",
      value: "pending",
      count: stats?.status?.pending || 0,
    },
    {
      icon: CheckCircle2,
      label: "Completed",
      value: "completed",
      count: stats?.status?.completed || 0,
    },
  ];

  const categoryLinks = [
    { label: "All Categories", value: "all", count: stats?.status?.all || 0 },
    { label: "Work", value: "work", count: stats?.category?.work || 0 },
    { label: "Personal", value: "personal", count: stats?.category?.personal || 0 },
    { label: "Appointment", value: "appointment", count: stats?.category?.appointment || 0 },
    { label: "Meeting", value: "meeting", count: stats?.category?.meeting || 0 },
    { label: "Other", value: "other", count: stats?.category?.other || 0 },
  ];

  const priorityLinks = [
    { label: "All Priorities", value: "all", count: stats?.status?.all || 0 },
    { label: "Low", value: "low", count: stats?.priority?.low || 0 },
    { label: "Medium", value: "medium", count: stats?.priority?.medium || 0 },
    { label: "High", value: "high", count: stats?.priority?.high || 0 },
  ];

  const categoryIcons = {
    all: FolderOpen,
    work: Briefcase,
    personal: User,
    appointment: CalendarDays,
    meeting: Users,
    other: FolderOpen,
  };

  const handleSelectStatus = (value) => {
    setStatus(value);
    onClose();
  };

  return (
    <>


      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                onClose();
              }
            }}
          >
            <motion.aside
              animate={{ x: 0 }}
              aria-label="Task sections sidebar"
              className="flex h-full w-full max-w-sm flex-col overflow-hidden border-r bg-background shadow-2xl"
              exit={{ x: "-100%" }}
              initial={{ x: "-100%" }}
              transition={softSpring}
            >
              <div className="flex h-16 items-center justify-between border-b px-4">
                <div>
                  <h2 className="text-sm font-semibold">Workspace Filters</h2>
                  <p className="text-xs text-muted-foreground">
                    Filter tasks by status, category, or priority.
                  </p>
                </div>
                <Button
                  aria-label="Close sidebar"
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                >
                  <PanelLeftClose />
                </Button>
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto scrollbar-none p-4">
                {/* Status Section */}
                <Card className="p-2  gap-2">
                  <CardHeader className="pt-2 px-3">
                    <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 pt-1 px-2 pb-2">
                    {statusLinks.map((item) => {
                      const Icon = item.icon;
                      const active = status === item.value;

                      return (
                        <button
                          aria-pressed={active}
                          className={
                            active
                              ? "flex w-full items-center justify-between rounded-lg bg-orange-600 hover:bg-orange-700 px-3 py-1.5 text-left text-xs text-white shadow-sm font-medium"
                              : "flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
                          }
                          key={item.value}
                          onClick={() => handleSelectStatus(item.value)}
                          type="button"
                        >
                          <span className="flex items-center gap-2">
                            <Icon size={14} />
                            {item.label}
                          </span>
                          <span className={active ? "text-[10px] font-semibold text-white/90" : "text-[10px] font-semibold text-muted-foreground/80"}>
                            {item.count}
                          </span>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Categories Section */}
                <Card className="p-2  gap-2">
                  <CardHeader className="pt-2 px-3">
                    <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 py-1 px-2 pb-2">
                    {categoryLinks.map((item) => {
                      const Icon = categoryIcons[item.value] || FolderOpen;
                      const active = category === item.value;

                      return (
                        <button
                          aria-pressed={active}
                          className={
                            active
                              ? "flex w-full items-center justify-between rounded-lg bg-orange-600 hover:bg-orange-700 px-3 py-1.5 text-left text-xs text-white shadow-sm font-medium"
                              : "flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
                          }
                          key={item.value}
                          onClick={() => {
                            setCategory(item.value);
                            onClose();
                          }}
                          type="button"
                        >
                          <span className="flex items-center gap-2 capitalize">
                            <Icon size={14} />
                            {item.label}
                          </span>
                          <span className={active ? "text-[10px] font-semibold text-white/90" : "text-[10px] font-semibold text-muted-foreground/80"}>
                            {item.count}
                          </span>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Priorities Section */}
                <Card className="p-2  gap-2">
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Priorities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 py-1 px-2 pb-2">
                    {priorityLinks.map((item) => {
                      const active = priority === item.value;

                      return (
                        <button
                          aria-pressed={active}
                          className={
                            active
                              ? "flex w-full items-center justify-between rounded-lg bg-orange-600 hover:bg-orange-700 px-3 py-1.5 text-left text-xs text-white shadow-sm font-medium"
                              : "flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
                          }
                          key={item.value}
                          onClick={() => {
                            setPriority(item.value);
                            onClose();
                          }}
                          type="button"
                        >
                          <span className="flex items-center gap-2 capitalize">
                            {item.value === "all" ? (
                              <Flag size={13} />
                            ) : (
                              <span className={`h-2 w-2 rounded-full ${
                                item.value === "low" ? "bg-emerald-500" :
                                item.value === "medium" ? "bg-amber-500" :
                                "bg-destructive"
                              }`} />
                            )}
                            {item.label}
                          </span>
                          <span className={active ? "text-[10px] font-semibold text-white/90" : "text-[10px] font-semibold text-muted-foreground/80"}>
                            {item.count}
                          </span>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Progress Section */}
                <Card className="p-2  gap-2">
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <BarChart3 size={14} />
                      Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 pt-1 space-y-2">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Task Completion</span>
                      <span className="font-semibold text-foreground">{completionRate}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        animate={{ width: `${completionRate}%` }}
                        className="h-full bg-orange-600"
                        initial={false}
                        transition={softSpring}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
