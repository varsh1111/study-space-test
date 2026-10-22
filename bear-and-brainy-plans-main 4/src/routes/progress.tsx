import { createFileRoute, Link } from '@tanstack/react-router';
import { usePlanner } from '@/lib/planner';
import { hours, hoursLabel, dateKey } from '@/lib/study';
import { StudyStats, SessionDialog, SessionList, GoalsPanel, SubjectStudyProgress } from '@/components/StudyWidgets';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/progress')({ head: () => pageHead('My Progress', 'Track study sessions, subject targets and daily and weekly study goals.'), component: StudyProgress });
function StudyProgress() {
  const { subjects, sessions } = usePlanner();
  return <div className="space-y-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">My Progress</h1><p className="mt-1 text-muted-foreground">A little more curious, a little more confident 🌱</p></div><SessionDialog /></div><StudyStats /><div className="flex flex-wrap gap-x-8 gap-y-2 border-y py-4 text-sm"><span>Today <strong>{hoursLabel(hours(sessions.filter(s => s.date === dateKey())))}</strong></span><span>This month <strong>{hoursLabel(hours(sessions.filter(s => s.date.startsWith(dateKey().slice(0,7)))))}</strong></span><span>All time <strong>{hoursLabel(hours(sessions))}</strong></span></div><div className="grid gap-8 lg:grid-cols-3"><section className="space-y-4 lg:col-span-2"><h2 className="text-xl font-bold">Subject study progress</h2><div className="grid gap-4 sm:grid-cols-2">{subjects.map(s => <div key={s.id} className="space-y-4 rounded-lg border bg-card p-5"><Link to="/subjects/$id" params={{ id: s.id }} className="font-semibold">{s.emoji} {s.name}</Link><SubjectStudyProgress subjectId={s.id} /></div>)}</div></section><GoalsPanel /></div><section className="space-y-4"><h2 className="text-xl font-bold">Study sessions</h2><SessionList /></section></div>;
}
