import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CheckCircle2, Clock, Trophy, Plus, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { usePlanner, progressOf, subjectColor, daysUntil, getAchievements } from "@/lib/planner";
import { AssignmentRow, AddAssignmentForm } from "@/components/AssignmentList";
import { AddSubjectDialog } from "@/components/AddSubjectDialog";
import { StudyStats, SessionDialog, GoalBar } from "@/components/StudyWidgets";
import { hours, hoursLabel, dateKey, weekSummary } from "@/lib/study";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Study Space Study Planner" },
      { name: "description", content: "See your subjects, progress, and upcoming deadlines at a glance." },
      { property: "og:title", content: "Dashboard — Study Space Study Planner" },
      { property: "og:description", content: "See your subjects, progress, and upcoming deadlines at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const planner = usePlanner();
  const { subjects, assignments, sessions, goals, exams } = planner;
  const overall = progressOf(assignments);
  const pending = assignments.filter((a) => !a.done).sort((a, b) => a.due.localeCompare(b.due));
  const soon = pending.filter((a) => daysUntil(a.due) <= 2);
  const unlocked = getAchievements(planner).filter((a) => a.unlocked).length;

  const stats = [
    { icon: BookOpen, label: "Subjects", value: subjects.length },
    { icon: CheckCircle2, label: "Completed", value: assignments.filter((a) => a.done).length },
    { icon: Clock, label: "To do", value: pending.length },
    { icon: Trophy, label: "Badges", value: unlocked },
  ];

  return (
    <div className="space-y-8">
      <section className="bg-hero rounded-3xl p-8 text-foreground shadow-soft">
        <p className="text-sm text-muted-foreground">Welcome back 👋</p>
        <h1 className="mt-1 text-3xl font-bold md:text-4xl">Your study universe ✨</h1>
        <p className="mt-2 text-muted-foreground">Small steps count. Let’s see your progress.</p>
        <div className="mt-6 max-w-md">
          <div className="mb-2 flex justify-between text-sm"><span>Assignment progress</span><span className="font-bold">{overall}%</span></div>
          <Progress value={overall} className="h-3 bg-card/60 [&>div]:bg-accent" />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-xl font-bold">Your study week</h2><p className="text-sm text-muted-foreground">Every little session adds up.</p></div>
          <SessionDialog />
        </div>
        <StudyStats />
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3 p-5 shadow-soft">
            <div className="flex items-center gap-2"><Clock className="size-5 text-primary" /><h3 className="font-semibold">Weekly study goal</h3></div>
            <GoalBar label="Study hours" actual={weekSummary(sessions).hours} target={goals.weeklyHours} />
            <GoalBar label="Study days" actual={weekSummary(sessions).days} target={goals.weeklyDays} unit="days" />
          </Card>
          <Card className="space-y-3 p-5 shadow-soft">
            <div className="flex items-center gap-2"><CalendarDays className="size-5 text-primary" /><h3 className="font-semibold">Coming up</h3></div>
            {exams.filter(e => e.date >= dateKey()).sort((a,b) => a.date.localeCompare(b.date)).slice(0,2).map(e => {
              const subject = subjects.find(s => s.id === e.subjectId);
              const days = Math.round((new Date(`${e.date}T00:00:00`).getTime() - new Date(`${dateKey()}T00:00:00`).getTime()) / 86400000);
              return <div key={e.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 p-3"><div><p className="font-medium">{e.title}</p><p className="text-xs text-muted-foreground">{subject?.emoji} {subject?.name}</p></div><span className="text-sm font-semibold">{days === 0 ? 'Today' : `${days} days left`}</span></div>;
            })}
            {!exams.some(e => e.date >= dateKey()) && <p className="text-sm text-muted-foreground">No exams added yet. Add an exam to make a revision plan.</p>}
            <Link to="/exams" className="inline-flex text-sm font-semibold text-primary hover:underline">Open exam tracker →</Link>
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex flex-row items-center gap-4 p-5 shadow-soft">
            <div className="grid size-11 place-items-center rounded-xl bg-secondary text-secondary-foreground"><s.icon className="size-5" /></div>
            <div><p className="font-display text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>
          </Card>
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="space-y-4 lg:col-span-3">
          <h2 className="text-xl font-bold">Upcoming deadlines</h2>
          <AddAssignmentForm />
          <div className="space-y-2">
            {pending.length === 0 && <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">Nothing due. Enjoy your break! 🎉</p>}
            {pending.slice(0, 8).map((a) => <AssignmentRow key={a.id} a={a} showSubject />)}
          </div>
        </section>

        <section className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div><h2 className="text-xl font-bold">Subject progress</h2><Link to="/progress" className="text-sm text-primary hover:underline">See study statistics →</Link></div>
            <AddSubjectDialog><Button size="sm" variant="outline"><Plus />Subject</Button></AddSubjectDialog>
          </div>
          <div className="space-y-3">
            {subjects.map((s) => {
              const list = assignments.filter((a) => a.subjectId === s.id);
              const p = progressOf(list);
              return (
                <Link key={s.id} to="/subjects/$id" params={{ id: s.id }} className="block rounded-xl border bg-card p-4 transition hover:shadow-soft">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg">{s.emoji}</span>
                    <span className="font-semibold">{s.name}</span>
                    <span className="ml-auto text-sm text-muted-foreground">{list.filter((a) => a.done).length}/{list.length}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full transition-all" style={{ width: `${p}%`, background: subjectColor(s.color) }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
