import { useEffect, useState } from "react";
import AuthPage from "./features/auth/AuthPage";
import Dashboard from "./features/dashboard/Dashboard";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("taskit_theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const App = () => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("taskit_token");
    const user = localStorage.getItem("taskit_user");

    return token && user ? { token, user: JSON.parse(user) } : null;
  });
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    if (!auth) {
      localStorage.removeItem("taskit_token");
      localStorage.removeItem("taskit_user");
      return;
    }

    localStorage.setItem("taskit_token", auth.token);
    localStorage.setItem("taskit_user", JSON.stringify(auth.user));
  }, [auth]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("taskit_theme", theme);
  }, [theme]);

  const handleAuth = (data) => {
    setAuth({
      token: data.token,
      user: data.user,
    });
  };

  const handleLogout = () => {
    setAuth(null);
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  if (!auth) {
    return (
      <AuthPage
        onAuth={handleAuth}
        onToggleTheme={toggleTheme}
        theme={theme}
      />
    );
  }

  return <Dashboard />;
};

export default App;
