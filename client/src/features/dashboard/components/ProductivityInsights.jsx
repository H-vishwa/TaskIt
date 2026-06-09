import { motion } from "motion/react";
import { Card, CardContent } from "../../../components/ui/card";
import { useTaskContext } from "../../../context/TaskContext";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

const ProductivityInsights = () => {
  const { tasks, stats } = useTaskContext();

  return (
    <motion.section className="w-full" variants={fadeUp}>
      <Card className="overflow-hidden border bg-gradient-to-r from-card to-card/90 shadow-sm relative">
        {/* Background ambient glow matching orange theme */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-36 w-36 rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -ml-16 -mb-16 h-36 w-36 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

        <CardContent className="px-6">
          <div className="grid gap-6 md:grid-cols-[1fr_auto]">
            {/* Left Column: Greeting & Suggestions */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex rounded-full bg-orange-600/10 px-2.5 py-0.5 text-xs font-semibold text-orange-600">
                    Insights
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {(() => {
                    const hour = new Date().getHours();
                    if (hour < 12) return "Good morning";
                    if (hour < 18) return "Good afternoon";
                    return "Good evening";
                  })()}
                  , Himanshu! 👋
                </h2>
              </div>

              {/* Smart Suggestion Notification */}
              <div className="flex items-start gap-3 rounded-xl bg-orange-600/5 border border-orange-600/10 p-3.5 text-sm text-foreground">
                <span className="text-lg leading-none">💡</span>
                <div className="space-y-1">
                  <p className="font-semibold text-orange-600">
                    Daily Focus Recommendation
                  </p>
                  <p className="text-muted-foreground leading-relaxed text-xs">
                    {(() => {
                      const todayTasks = tasks.filter((t) => {
                        if (!t.dueDate || t.status === "completed")
                          return false;
                        const today = new Date();
                        const due = new Date(t.dueDate);
                        return today.toDateString() === due.toDateString();
                      }).length;

                      const highPending = tasks.filter(
                        (t) =>
                          t.priority === "high" && t.status !== "completed",
                      ).length;
                      const totalPending = stats.status.pending;

                      if (todayTasks > 0) {
                        return `You have ${todayTasks} task${todayTasks > 1 ? "s" : ""} due today! Focus on completing ${todayTasks > 1 ? "them" : "it"} to stay on schedule.`;
                      }
                      if (highPending > 0) {
                        return `You have ${highPending} high-priority task${highPending > 1 ? "s" : ""} pending. We recommend addressing these first.`;
                      }
                      if (totalPending > 0) {
                        return `You have ${totalPending} pending task${totalPending > 1 ? "s" : ""} in your workspace. Select a task to make progress!`;
                      }
                      return "Your workspace is fully clear! Take a moment to plan your next major goal or enjoy the free time. 🎉";
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Completion Ring */}
            <div className="flex items-center gap-5 justify-center border-t pt-6 md:border-t-0 md:pt-0 md:border-l md:pl-6 border-border/60">
              <div className="relative flex items-center justify-center">
                {/* SVG Progress Circle */}
                <svg className="w-20 h-20 transform -rotate-90">
                  {/* Track circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    className="stroke-muted"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="34"
                    className="stroke-orange-600"
                    strokeWidth="7"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 34}
                    animate={{
                      strokeDashoffset:
                        2 *
                        Math.PI *
                        34 *
                        (1 -
                          (stats.status.all
                            ? stats.status.completed / stats.status.all
                            : 0)),
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-bold text-foreground">
                    {stats.status.all
                      ? Math.round(
                          (stats.status.completed / stats.status.all) * 100,
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                  Workspace Progress
                </p>
                <h3 className="text-sm font-bold text-foreground">
                  {stats.status.completed} / {stats.status.all} Done
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {stats.status.pending} tasks remaining
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
};

export default ProductivityInsights;
