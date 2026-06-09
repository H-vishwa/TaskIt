import { AnimatePresence, motion } from "motion/react";
import TaskCard from "./TaskCard";

const listVariants = {
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const TaskList = ({
  emptyMessage = "No tasks found. Add a new task or adjust your filters.",
  tasks,
}) => {
  if (!tasks.length) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
      >
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate="visible"
      className="grid gap-3"
      initial="hidden"
      variants={listVariants}
    >
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskList;
