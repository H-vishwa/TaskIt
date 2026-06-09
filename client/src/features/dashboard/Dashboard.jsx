import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Circle } from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Card, CardContent } from "../../components/ui/card";

import Header from "./components/Header";
import Sidebar from "./components/sidebar";
import AddTask from "../tasks/addTask";
import TaskList from "../tasks/TaskList";
import ViewTask from "../tasks/ViewTask";
import ProductivityInsights from "./components/ProductivityInsights";
import PaginationControl from "./components/PaginationControl";
import { TaskProvider } from "../../context/TaskContext";
import { useTaskContext } from "../../context/TaskContext";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

const DashboardContent = () => {
  const {
    tasks,
    loading,
    error,
    status,
    isTaskDetailOpen,
    selectedTask,
    closeTaskDetails,
  } = useTaskContext();

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  return (
    <main className="min-h-screen bg-background text-foreground ">
      <Header />
      <Sidebar />
      <AddTask />

      {/* View Task Panel */}
      <AnimatePresence>
        {isTaskDetailOpen && selectedTask && (
          <ViewTask
            isOpen={isTaskDetailOpen}
            onClose={closeTaskDetails}
            task={selectedTask}
          />
        )}
      </AnimatePresence>

      <motion.div
        animate="visible"
        className="mx-auto max-w-5xl space-y-5 px-4 py-6"
        initial="hidden"
        transition={{ staggerChildren: 0.06 }}>
        <ProductivityInsights />

        <motion.div className="mx-auto max-w-5xl" variants={fadeUp}>
          <section className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  Loading tasks...
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {status === "all" ? (
                  <>
                    <section className="space-y-3">
                      <div>
                        <h2 className="flex items-center gap-2 text-sm font-semibold">
                          <Circle size={16} />
                          Pending
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Tasks still waiting for a decision.
                        </p>
                      </div>
                      <TaskList
                        emptyMessage="No pending tasks on this page."
                        tasks={pendingTasks}
                      />
                    </section>

                    <section className="space-y-3">
                      <div>
                        <h2 className="flex items-center gap-2 text-sm font-semibold">
                          <CheckCircle2 size={16} />
                          Completed
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Completed tasks move here with a line through the
                          title.
                        </p>
                      </div>
                      <TaskList
                        emptyMessage="No completed tasks on this page."
                        tasks={completedTasks}
                      />
                    </section>
                  </>
                ) : (
                  <TaskList
                    emptyMessage={`No ${status} tasks found.`}
                    tasks={tasks}
                  />
                )}
              </div>
            )}

            <PaginationControl />
          </section>
        </motion.div>
      </motion.div>
    </main>
  );
};

const Dashboard = () => {
  return (
    <TaskProvider>
      <DashboardContent />
    </TaskProvider>
  );
};

export default Dashboard;
