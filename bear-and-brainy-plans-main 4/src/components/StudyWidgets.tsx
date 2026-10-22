import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, getDay, addMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { usePlanner } from '@/lib/planner';
import { dateKey, goalPercent, hours, hoursLabel, shiftDate, studyDays, weekSummary, streaks, type StudySession } from '@/lib/study';

export function SubjectSelect({ value, onChange, id }: { value: string; onChange: (v: string) => void; id?: string }) {
  const { subjects } = usePlanner();
  return <Select value={value} onValueChange={onChange}><SelectTrigger id={id} className="w-full"><SelectValue placeholder="Select subject" /></SelectTrigger><SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.emoji} {s.name}</SelectItem>)}</SelectContent></Select>;
}
export function SessionDialog({ session, subjectId }: { session?: StudySession; subjectId?: string }) {
  const { subjects, saveSession } = usePlanner();
  const [open, setOpen] = useState(false);
  const [sid, setSid] = useState(session?.subjectId ?? subjectId ?? subjects[0]?.id ?? '');
  const [date, setDate] = useState(session?.date ?? dateKey());
  const [duration, setDuration] = useState(String(session ? session.minutes / 60 : 1));
  const [notes, setNotes] = useState(session?.notes ?? '');
  const validSid = subjects.some(s => s.id === sid) ? sid : subjects[0]?.id ?? '';
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant={session ? 'ghost' : 'default'} size={session ? 'icon' : 'default'} aria-label={session ? 'Edit study session' : undefined} disabled={!subjects.length}>{session ? <Pencil className="size-4" /> : <><Plus />Log study session</>}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{session ? 'Edit study session' : 'A little study, a little progress ✨'}</DialogTitle></DialogHeader>
    <form className="space-y-4" onSubmit={e => { e.preventDefault(); if (!validSid || Number(duration) <= 0 || date > dateKey()) return; saveSession({ subjectId: validSid, date, minutes: Math.round(Number(duration) * 60), notes: notes.trim() }, session?.id); setOpen(false); if (!session) { setNotes(''); setDuration('1'); } }}>
      <div className="space-y-2"><Label htmlFor="session-subject">Subject</Label><SubjectSelect id="session-subject" value={validSid} onChange={setSid} /></div>
      <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="session-date">Date</Label><Input id="session-date" type="date" required max={dateKey()} value={date} onChange={e => setDate(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="session-hours">Hours studied</Label><Input id="session-hours" type="number" required min="0.05" max="24" step="0.05" value={duration} onChange={e => setDuration(e.target.value)} /></div></div>
      <div className="space-y-2"><Label htmlFor="session-notes">What did you work on? (optional)</Label><Textarea id="session-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Lecture notes, revision, practice questions…" /></div><Button className="w-full" type="submit">Save session</Button>
    </form></DialogContent></Dialog>;
}
export function GoalBar({ label, actual, target, unit = 'h' }: { label: string; actual: number; target: number; unit?: string }) {
  return <div className="space-y-2"><div className="flex flex-wrap justify-between gap-2 text-sm"><span>{label}</span><span className="font-semibold">{Number(actual.toFixed(2))} / {target} {unit}</span></div><Progress value={goalPercent(actual, target)} className="h-2" /></div>;
}
export function GoalsPanel() {
  const { sessions, goals, setGoals } = usePlanner();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(goals);
  const week = weekSummary(sessions);
  return <section className="space-y-5"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Your study goals</h2><Dialog open={open} onOpenChange={v => { setOpen(v); if (v) setDraft(goals); }}><DialogTrigger asChild><Button size="icon" variant="outline" aria-label="Edit study goals"><Target className="size-4" /></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Your pace, your goals</DialogTitle></DialogHeader><form className="space-y-4" onSubmit={e => { e.preventDefault(); setGoals(draft); setOpen(false); }}>{([{ key: 'dailyHours', label: 'Daily study hours', max: 24, step: 0.5 }, { key: 'weeklyHours', label: 'Weekly study hours', max: 168, step: 0.5 }, { key: 'weeklyDays', label: 'Study days per week', max: 7, step: 1 }] as const).map(f => <div className="space-y-2" key={f.key}><Label htmlFor={f.key}>{f.label}</Label><Input id={f.key} type="number" min={f.step} max={f.max} step={f.step} required value={draft[f.key]} onChange={e => setDraft({ ...draft, [f.key]: Number(e.target.value) })} /></div>)}<Button type="submit">Save goals</Button></form></DialogContent></Dialog></div>
    <GoalBar label="Today" actual={hours(sessions.filter(s => s.date === dateKey()))} target={goals.dailyHours} /><GoalBar label="This week" actual={week.hours} target={goals.weeklyHours} /><GoalBar label="Study days this week" actual={week.days} target={goals.weeklyDays} unit="days" />
  </section>;
}
export function SessionList({ subjectId }: { subjectId?: string }) {
  const { sessions, subjects, removeSession } = usePlanner();
  const list = sessions.filter(s => !subjectId || s.subjectId === subjectId).sort((a, b) => b.date.localeCompare(a.date));
  return <div className="space-y-2">{!list.length && <p className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">Your first study session is a fresh start 🌱</p>}{list.map(s => { const sub = subjects.find(x => x.id === s.subjectId); return <div key={s.id} className="flex items-center gap-3 rounded-lg border bg-card p-4"><span className="text-xl">{sub?.emoji}</span><div className="min-w-0 flex-1"><p className="font-semibold">{sub?.name} <span className="ml-2 text-primary">{hoursLabel(s.minutes / 60)}</span></p><p className="text-xs text-muted-foreground">{format(parseISO(s.date), 'EEE, d MMM yyyy')}</p>{s.notes && <p className="mt-1 break-words text-sm text-muted-foreground">{s.notes}</p>}</div><div className="flex shrink-0"><SessionDialog session={s} /><Button size="icon" variant="ghost" aria-label="Delete study session" onClick={() => { if (confirm('Delete this study session?')) removeSession(s.id); }}><Trash2 className="size-4" /></Button></div></div>; })}</div>;
}
export function StudyCalendar() {
  const { sessions } = usePlanner();
  const [month, setMonth] = useState(dateKey());
  const [selected, setSelected] = useState<string | null>(null);
  const first = startOfMonth(parseISO(month));
  const count = Number(format(endOfMonth(first), 'd'));
  const offset = (getDay(first) + 6) % 7;
  const totalFor = (date: string) => hours(sessions.filter(s => s.date === date));
  return <section className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">{format(first, 'MMMM yyyy')}</h2><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label="Previous month" onClick={() => { setMonth(dateKey(addMonths(first, -1))); setSelected(null); }}><ChevronLeft /></Button><Button size="icon" variant="ghost" aria-label="Next month" onClick={() => { setMonth(dateKey(addMonths(first, 1))); setSelected(null); }}><ChevronRight /></Button></div></div><div className="grid grid-cols-7 gap-2 text-center">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d} className="py-2 text-xs text-muted-foreground">{d}</span>)}{Array.from({ length: offset }, (_, i) => <div key={`blank-${i}`} />)}{Array.from({ length: count }, (_, i) => { const date = shiftDate(dateKey(first), i); const n = totalFor(date); return <Button key={date} variant="ghost" title={`${date}: ${hoursLabel(n)}`} aria-label={`${date}, ${hoursLabel(n)} studied`} onClick={() => setSelected(date)} className={`h-auto min-h-12 flex-col gap-0.5 rounded-lg py-2 ${n >= 2 ? 'bg-chart-1/70' : n > 0 ? 'bg-secondary' : 'bg-muted/60'} ${date === dateKey() ? 'ring-1 ring-primary' : ''} ${selected === date ? 'outline outline-2 outline-primary' : ''}`}><span>{i + 1}</span>{n > 0 && <span className="text-[10px]">{hoursLabel(n)}</span>}</Button>; })}</div>{selected && <div className="border-t pt-3"><p className="font-medium">{format(parseISO(selected), 'd MMMM')} · {hoursLabel(totalFor(selected))}</p>{sessions.filter(s => s.date === selected).map(s => <p key={s.id} className="break-words text-sm text-muted-foreground">{hoursLabel(s.minutes / 60)}{s.notes ? ` · ${s.notes}` : ''}</p>)}{!totalFor(selected) && <p className="text-sm text-muted-foreground">A rest day. Tomorrow is a fresh start.</p>}</div>}<p className="text-xs text-muted-foreground">Every study day counts. Rest days belong here too.</p></section>;
}
export function StudyStats() {
  const { sessions } = usePlanner();
  const week = weekSummary(sessions); const streak = streaks(sessions);
  return <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[{ label: 'Hours this week', value: hoursLabel(week.hours), tone: 'bg-secondary' }, { label: 'Study days this week', value: week.days, tone: 'bg-chart-3/20' }, { label: 'Current streak', value: `${streak.current} days`, tone: 'bg-chart-2/20' }, { label: 'Longest streak', value: `${streak.longest} days`, tone: 'bg-chart-4/20' }].map(s => <div key={s.label} className={`rounded-lg border p-5 ${s.tone}`}><p className="font-display text-2xl font-bold">{s.value}</p><p className="mt-1 text-sm text-muted-foreground">{s.label}</p></div>)}</div>;
}
export function DailyChart({ sessions, start }: { sessions: StudySession[]; start: string }) {
  const values = Array.from({ length: 7 }, (_, i) => { const date = shiftDate(start, i); return { date, total: hours(sessions.filter(s => s.date === date)) }; });
  const max = Math.max(2, ...values.map(v => v.total));
  return <div role="img" aria-label="Daily study hours this week" className="flex h-48 items-end gap-3 border-b pb-2">{values.map(v => <div key={v.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-semibold">{hoursLabel(v.total)}</span><div className="w-full max-w-12 rounded-t-md bg-chart-3" style={{ height: `${Math.max(2, v.total / max * 120)}px` }} /><span className="text-xs text-muted-foreground">{format(parseISO(v.date), 'EEE')}</span></div>)}</div>;
}
export function SubjectStudyProgress({ subjectId }: { subjectId: string }) {
  const { subjects, sessions } = usePlanner(); const subject = subjects.find(s => s.id === subjectId); const list = sessions.filter(s => s.subjectId === subjectId);
  return <div className="space-y-3"><div className="flex flex-wrap justify-between gap-2 text-sm"><span>{hoursLabel(hours(list))} studied</span><span className="text-muted-foreground">{studyDays(list)} study days</span></div>{subject?.targetHours ? <GoalBar label="Study target" actual={hours(list)} target={subject.targetHours} /> : <p className="text-sm text-muted-foreground">No study target set yet.</p>}</div>;
}
