import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Calendar } from "../../../components/ui/calendar";
import { Label } from "../../../components/ui/label";

const DatePickerPopover = ({ selectedDate, onSelectDate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2 relative">
      <Label>Due Date (Duration)</Label>
      <div>
        <Button
          type="button"
          variant="outline"
          className="h-9 sm:h-11 w-full justify-start text-left font-normal bg-background dark:bg-input/30 text-sm"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {selectedDate ? (
            new Date(selectedDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          ) : (
            <span className="text-muted-foreground">Pick a due date</span>
          )}
        </Button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-4 left-0 mt-1 z-50 rounded-md border bg-popover p-1 shadow-md">
            <Calendar
              mode="single"
              selected={selectedDate ? new Date(selectedDate) : undefined}
              onSelect={(date) => {
                onSelectDate(date ? date.toISOString() : null);
                setIsOpen(false);
              }}
              initialFocus
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DatePickerPopover;
