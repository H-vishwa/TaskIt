import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

const ThemeToggle = ({ theme, onToggle }) => {
  const isDark = theme === "dark";

  return (
    <Button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      size="icon"
      type="button"
      variant="outline"
      className="bg-transparent border-none shadow-none hover:bg-transparent hover:text-primary transition-color cursor-pointer"
      onClick={onToggle}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
};

export default ThemeToggle;
