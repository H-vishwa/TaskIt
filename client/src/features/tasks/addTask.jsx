import { AnimatePresence, motion } from "motion/react";
import { useTaskContext } from "../../context/TaskContext";
import TaskForm from "./TaskForm";

const softSpring = {
  type: "spring",
  stiffness: 280,
  damping: 28,
};

const AddTask = () => {
  const {
    isTaskDialogOpen,
    editingTask,
    closeTaskDialog,
    handleSaveTask,
    saving,
  } = useTaskContext();

  return (
    <AnimatePresence>
      {isTaskDialogOpen && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeTaskDialog();
            }
          }}>
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-labelledby="task-form-title"
            aria-modal="true"
            className="w-full max-w-md sm:max-w-3xl max-h-screen overflow-y-auto scrollbar-none sm:max-h-none sm:overflow-visible rounded-xl"
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            role="dialog"
            transition={softSpring}>
            <TaskForm
              editingTask={editingTask}
              onCancelEdit={closeTaskDialog}
              onSubmit={handleSaveTask}
              saving={saving}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTask;
