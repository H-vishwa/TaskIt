import { useEffect, useState } from "react";
import { Plus, Save, X } from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import AttachmentDropzone from "./components/AttachmentDropzone";
import DatePickerPopover from "./components/DatePickerPopover";

const initialForm = {
  title: "",
  description: "",
  category: "other",
  priority: "medium",
  dueDate: null,
};

const TaskForm = ({ editingTask, onCancelEdit, onSubmit, saving }) => {
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title,
        description: editingTask.description || "",
        category: editingTask.category || "other",
        priority: editingTask.priority || "medium",
        dueDate: editingTask.dueDate || null,
      });
    } else {
      setForm(initialForm);
    }
    setFiles([]);
    setError("");
  }, [editingTask]);

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSelectDate = (dateString) => {
    setForm((current) => ({
      ...current,
      dueDate: dateString,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Task title is required");
      return;
    }

    setError("");
    const saved = await onSubmit(form, files);

    if (saved && !editingTask) {
      setForm(initialForm);
      setFiles([]);
    }
  };

  return (
    <Card className="border-none sm:border bg-transparent sm:bg-card">
      <form onSubmit={handleSubmit}>
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
          <CardTitle id="task-form-title" className="text-lg sm:text-2xl font-bold">
            {editingTask ? "Edit task" : "Add task"}
          </CardTitle>
          <CardDescription className="text-[11px] sm:text-sm">
            {editingTask
              ? "Update the task details."
              : "Capture a clear next action."}
          </CardDescription>
          {onCancelEdit && (
            <CardAction>
              <Button
                aria-label={editingTask ? "Cancel editing" : "Close add task"}
                disabled={saving}
                size="icon"
                type="button"
                variant="outline"
                className="h-8 w-8 sm:h-9 sm:w-9"
                onClick={onCancelEdit}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardAction>
          )}
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-2.5 sm:space-y-3">
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="task-title" className="text-xs sm:text-sm">Title</Label>
            <Input
              className="h-9 sm:h-11 text-sm"
              id="task-title"
              name="title"
              onChange={updateField}
              placeholder="Prepare sprint handoff"
              value={form.title}
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="task-description" className="text-xs sm:text-sm">Description</Label>
            <Textarea
              className="min-h-17.5 sm:min-h-24 text-sm"
              id="task-description"
              name="description"
              onChange={updateField}
              placeholder="Add context, blockers, or acceptance notes"
              value={form.description}
            />
          </div>

          <div className="grid sm:grid-cols-3 jus gap-2 sm:gap-3">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="task-category" className="text-xs sm:text-sm">Category</Label>
              <Select
                value={form.category}
                onValueChange={(val) =>
                  setForm((current) => ({ ...current, category: val }))
                }
              >
                <SelectTrigger id="task-category" className="h-9 sm:h-11 w-full bg-background dark:bg-input/30 capitalize text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="task-priority" className="text-xs sm:text-sm">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(val) =>
                  setForm((current) => ({ ...current, priority: val }))
                }
              >
                <SelectTrigger id="task-priority" className="h-9 sm:h-11 w-full bg-background dark:bg-input/30 capitalize text-sm">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          <DatePickerPopover
          
            selectedDate={form.dueDate}
            onSelectDate={handleSelectDate}
          />
          </div>


          <AttachmentDropzone
            files={files}
            setFiles={setFiles}
            setError={setError}
          />

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <Button className="h-9 sm:h-10 w-full bg-orange-600 hover:bg-orange-700 text-white border-none font-semibold text-sm flex items-center justify-center gap-1.5" disabled={saving} type="submit">
            {editingTask ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{saving ? "Saving..." : editingTask ? "Save changes" : "Add task"}</span>
          </Button>
        </CardContent>
      </form>
    </Card>
  );
};

export default TaskForm;
