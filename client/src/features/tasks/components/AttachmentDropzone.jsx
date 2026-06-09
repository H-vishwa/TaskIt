import { useRef, useState } from "react";
import { Paperclip, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Label } from "../../../components/ui/label";

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AttachmentDropzone = ({ files, setFiles, setError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const addFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`"${file.name}" exceeds 5 MB limit`);
        return false;
      }
      return true;
    });

    setFiles((current) => {
      const total = [...current, ...validFiles];
      if (total.length > 5) {
        setError("Maximum 5 files allowed");
        return current;
      }
      return total;
    });
  };

  const removeFile = (index) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Attachment Drop Zone */}
      <div className="space-y-1 sm:space-y-2">
        <Label className="flex items-center gap-1.5 text-xs sm:text-sm">
          <Paperclip size={14} />
          Attachments
        </Label>
        <div
          className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-xl border-2 border-dashed bg-muted/30 px-4 py-3.5 sm:py-5 cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            accept="*/*"
            className="hidden"
            multiple
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
            type="file"
          />
          <Upload className="text-muted-foreground w-4 h-4 sm:w-5.5 sm:h-5.5" />
          <p className="text-xs sm:text-sm text-muted-foreground">
            Drop files here or{" "}
            <span className="font-medium text-orange-600 underline underline-offset-2 cursor-pointer">
              browse
            </span>
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground/60">
            Max 5 files · 5 MB each
          </p>
        </div>
      </div>

      {/* Selected Files */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-1.5 overflow-hidden"
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
          >
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-1.5 transition-colors duration-150 hover:bg-muted/50"
                exit={{ opacity: 0, x: -10 }}
                initial={{ opacity: 0, x: 10 }}
                layout
              >
                <Paperclip className="shrink-0 text-muted-foreground" size={14} />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {file.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
                <button
                  aria-label={`Remove ${file.name}`}
                  className="shrink-0 rounded-full p-0.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => removeFile(index)}
                  type="button"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttachmentDropzone;
