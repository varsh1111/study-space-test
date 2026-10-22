import { addDays, differenceInCalendarDays, format, parseISO, startOfWeek } from 'date-fns';

export type StudySession = { id: string; subjectId: string; date: string; minutes: number; notes: string };
export type StudyGoals = { dailyHours: number; weeklyHours: number; weeklyDays: number };
export type TopicStatus = 'not-started' | 'learning' | 'practice' | 'confident';
export type ExamTopic = { id: string; title: string; status: TopicStatus };
export type Exam = { id: string; subjectId: string; title: string; date: string; topics: ExamTopic[] };
export const topicStatuses: { value: TopicStatus; label: string }[] = [
  { value: 'not-started', label: 'Not started' }, { value: 'learning', label: 'Currently learning' },
  { value: 'practice', label: 'Needs more practice' }, { value: 'confident', label: 'Feeling confident' },
];
export const dateKey = (date = new Date()) => format(date, 'yyyy-MM-dd');
export const shiftDate = (date: string, days: number) => dateKey(addDays(parseISO(date), days));
export const weekStart = (date = dateKey()) => dateKey(startOfWeek(parseISO(date), { weekStartsOn: 1 }));
export const hours = (sessions: StudySession[]) => sessions.reduce((n, s) => n + s.minutes, 0) / 60;
export const hoursLabel = (n: number) => `${Number(n.toFixed(2))}h`;
export const studyDays = (sessions: StudySession[]) => new Set(sessions.map(s => s.date)).size;
export const inPeriod = (sessions: StudySession[], from: string, to: string) => sessions.filter(s => s.date >= from && s.date <= to);
export const goalPercent = (actual: number, target: number) => target > 0 ? Math.min(100, Math.round(actual / target * 100)) : 0;
export function weekSummary(sessions: StudySession[], date = dateKey()) {
  const start = weekStart(date);
  const current = inPeriod(sessions, start, shiftDate(start, 6));
  const previous = inPeriod(sessions, shiftDate(start, -7), shiftDate(start, -1));
  return { start, current, previous, hours: hours(current), previousHours: hours(previous), days: studyDays(current), previousDays: studyDays(previous) };
}
export function streaks(sessions: StudySession[], today = dateKey()) {
  const dates = [...new Set(sessions.filter(s => s.date <= today).map(s => s.date))].sort();
  let longest = 0, run = 0;
  dates.forEach((date, i) => {
    run = i > 0 && differenceInCalendarDays(parseISO(date), parseISO(dates[i - 1])) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  });
  const set = new Set(dates);
  let cursor = set.has(today) ? today : shiftDate(today, -1);
  let current = 0;
  while (set.has(cursor)) { current++; cursor = shiftDate(cursor, -1); }
  return { current, longest };
}
