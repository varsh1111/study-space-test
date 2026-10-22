import { createFileRoute } from '@tanstack/react-router';
import { StudyStats, StudyCalendar, GoalsPanel, SessionDialog } from '@/components/StudyWidgets';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/calendar')({ head: () => pageHead('Study Calendar', 'See study days, your current and longest streaks and your study goals.'), component: CalendarPage });
function CalendarPage() { return <div className="space-y-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Study Calendar</h1><p className="mt-1 text-muted-foreground">Your little constellation of study days ✨</p></div><SessionDialog /></div><StudyStats /><div className="grid gap-10 lg:grid-cols-3"><div className="lg:col-span-2"><StudyCalendar /></div><GoalsPanel /></div></div>; }
