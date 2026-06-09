import { useEffect, useState } from "react";
import { LogOut, Plus, PanelLeftOpen, Search, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import ThemeToggle from "../../../components/ThemeToggle";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useTaskContext } from "../../../context/TaskContext";

const getStoredUser = () => {
  const user = localStorage.getItem("taskit_user");

  return user ? JSON.parse(user) : { name: "User" };
};

const getStoredTheme = () => {
  const theme = localStorage.getItem("taskit_theme");

  if (theme === "light" || theme === "dark") {
    return theme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const Header = () => {
  const { onAddTask, search, setSearch, isSidebarOpen, setIsSidebarOpen } =
    useTaskContext();
  const [theme, setTheme] = useState(getStoredTheme);
  const [user] = useState(getStoredUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const onOpenSidebar = () => setIsSidebarOpen(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("taskit_theme", theme);
  }, [theme]);

  // Close mobile menu if sidebar opens, and vice versa
  useEffect(() => {
    if (isSidebarOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    if (isMobileMenuOpen && setIsSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [isMobileMenuOpen, setIsSidebarOpen]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    localStorage.removeItem("taskit_token");
    localStorage.removeItem("taskit_user");
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-card/10 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
        <div className="flex items-center gap-2 shrink-0">
          <Button
            aria-label="Open sidebar"
            size="icon"
            variant="ghost"
            onClick={onOpenSidebar}
            className="hidden sm:flex h-9 w-9 text-muted-foreground hover:text-foreground">
            <PanelLeftOpen size={18} />
          </Button>
          <img
            src={theme === "dark" ? "/DarkLogo.png" : "/Logo.png"}
            alt="TaskIt Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            style={{
              filter:
                theme === "dark"
                  ? "drop-shadow(0 4px 12px rgba(255, 255, 255, 0.15))"
                  : "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))",
            }}
          />
          <div>
            <h1 className="text-base sm:text-lg font-semibold leading-tight">
              TaskIt Workspace
            </h1>
            <p className="hidden sm:block text-[11px] sm:text-xs text-muted-foreground">
              Signed in as {user.name}
            </p>
          </div>
        </div>

        {/* Center: Search input (hidden on mobile, in drawer instead) */}
        <div className="hidden sm:block flex-1 max-w-35 xs:max-w-[180px] sm:max-w-xs md:max-w-sm px-1">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={14}
            />
            <Input
              className="h-8 pl-8 pr-3 text-xs w-full bg-background dark:bg-input/20 focus-visible:ring-orange-600/20 focus-visible:border-orange-600/50"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              type="text"
              value={search}
            />
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            type="button"
            onClick={onAddTask}
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm border-none h-8 px-2.5 sm:px-3">
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Add task</span>
          </Button>
          <ThemeToggle onToggle={toggleTheme} theme={theme} />
          <Button
            type="button"
            className="transition duration-300 hover:bg-destructive/15 hover:text-destructive/70 hover:border-red-600/10 dark:hover:bg-destructive/5 h-8 px-2.5 sm:px-3"
            variant="outline"
            onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>

        {/* Mobile Sidebar & Menu Toggle Buttons */}
        <div className="flex items-center gap-1 sm:hidden">
          <Button
            aria-label="Open filter sidebar"
            size="icon"
            variant="ghost"
            onClick={onOpenSidebar}
            className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <PanelLeftOpen size={18} />
          </Button>
          <Button
            aria-label="Toggle menu"
            size="icon"
            variant="ghost"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-9 w-9 text-muted-foreground hover:text-foreground">
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="sm:hidden border-t bg-card px-4 py-4 space-y-4 overflow-hidden">
            {/* Search Bar on Mobile */}
            <div className="relative w-full">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={14}
              />
              <Input
                className="h-9 pl-8 pr-3 text-xs w-full bg-background dark:bg-input/20 focus-visible:ring-orange-600/20 focus-visible:border-orange-600/50"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks..."
                type="text"
                value={search}
              />
            </div>

            {/* Mobile Actions Row */}
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                onClick={() => {
                  onAddTask();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm border-none h-9 flex items-center justify-center gap-1.5">
                <Plus className="h-4 w-4" />
                <span>Add task</span>
              </Button>
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-xs text-muted-foreground">
                  Appearance / Account
                </span>
                <div className="flex items-center gap-3">
                  <ThemeToggle onToggle={toggleTheme} theme={theme} />
                  <Button
                    type="button"
                    className="transition duration-300 hover:bg-destructive/15 hover:text-destructive hover:border-destructive dark:hover:bg-destructive/5 h-9 px-3 flex items-center gap-1.5"
                    variant="outline"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}>
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
