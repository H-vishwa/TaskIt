import { useState } from "react";
import {
  CheckCircle,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { authApi } from "../../lib/api";

const platformFeatures = [
  "Secure JWT sessions",
  "Focused CRUD workflow",
  "Search, filters, pagination",
];

const emptyForm = {
  name: "",
  email: "",
  password: "",
};

const AuthPage = ({ onAuth, onToggleTheme, theme }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isLogin = mode === "login";

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const validate = () => {
    if (!isLogin && !form.name.trim()) {
      return "Name is required";
    }

    if (!form.email.includes("@")) {
      return "Enter a valid email address";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : form;
      const data = isLogin
        ? await authApi.login(payload)
        : await authApi.register(payload);

      onAuth(data);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isLogin ? "register" : "login");
    setForm(emptyForm);
    setError("");
  };

  return (
    <main
      className="min-h-screen bg-background text-foreground "
      style={{
        background:
          theme === "dark"
            ? `
              radial-gradient(ellipse 120% 80% at 70% 40%, rgba(255, 20, 147, 0.15), transparent 50%),
              radial-gradient(ellipse 100% 60% at 30% 45%, rgba(0, 255, 255, 0.12), transparent 60%),
              radial-gradient(ellipse 90% 70% at 50% 76%, rgba(138, 43, 226, 0.18), transparent 65%),
              radial-gradient(ellipse 110% 50% at 80% 20%, rgba(255, 215, 0, 0.08), transparent 66%),
              #000000
              `
            : `
                radial-gradient(ellipse 80% 60% at 5% 40%, rgba(175, 109, 255, 0.48), transparent 67%),
                radial-gradient(ellipse 70% 60% at 45% 45%, rgba(255, 100, 180, 0.41), transparent 67%),
                radial-gradient(ellipse 82% 92% at 83% 76%, rgba(255, 235, 170, 0.44), transparent 63%),
                radial-gradient(ellipse 60% 48% at 75% 20%, rgba(120, 130, 255, 0.36), transparent 66%),
                linear-gradient(45deg, #f7eaff 0%, #fde2ed 100%)
              `,
      }}>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-5">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center ">
              <img
                src={theme === "dark" ? "/DarkLogo.png" : "/Logo.png"}
                alt="TaskIt Logo"
                className="w-13 h-13 object-contain"
                style={{
                  filter:
                    theme === "dark"
                      ? "drop-shadow(0 4px 12px rgba(255, 255, 255, 0.15))"
                      : "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))",
                }}
              />
            </span>
            <div>
              <h1 className="text-3xl font-semibold">Task It!</h1>
            </div>
          </div>
          <ThemeToggle onToggle={onToggleTheme} theme={theme} />
        </header>

        <div className="grid flex-1 gap-8 py-8 lg:grid-cols-[1fr_390px] lg:items-center">
          <section className="space-y-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex rounded-full items-center gap-2 border bg-card px-3 py-1 text-xs text-muted-foreground">
                <LockKeyhole size={14} />
                Private workspace for daily execution
              </div>
              <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
                Plan, track, and finish work from one calm dashboard.
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                TaskIt keeps the product surface focused: create tasks, filter
                priorities, update progress, and move through your queue without
                visual noise.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              {platformFeatures.map((item) => (
                <div
                  className="flex items-center gap-2 border rounded-lg bg-card p-3"
                  key={item}>
                  <CheckCircle className="text-emerald-500" size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <Card className="shadow-xl shadow-foreground/5">
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">
                  {isLogin ? "Welcome back" : "Create account"}
                </CardTitle>
                <CardDescription>
                  {isLogin
                    ? "Sign in to your workspace."
                    : "Start with a secure workspace."}
                </CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={switchMode}>
                {isLogin ? "Register" : "Login"}
              </Button>
            </CardHeader>

            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      className="h-11"
                      id="name"
                      name="name"
                      onChange={updateField}
                      placeholder="Himanshu"
                      value={form.name}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    className="h-11"
                    id="email"
                    name="email"
                    onChange={updateField}
                    placeholder="you@example.com"
                    type="email"
                    value={form.email}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      className="h-11 pr-11"
                      id="password"
                      name="password"
                      onChange={updateField}
                      placeholder="Minimum 6 characters"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                    />
                    <Button
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      size="icon"
                      type="button"
                      variant="ghost"
                      onClick={() => setShowPassword((current) => !current)}>
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  className="h-11 w-full bg-orange-600 hover:bg-orange-700 text-white border-none font-semibold shadow-md"
                  disabled={loading}
                  type="submit">
                  {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;
