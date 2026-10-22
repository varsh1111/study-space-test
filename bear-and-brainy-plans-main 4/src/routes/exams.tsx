import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { CalendarDays, GraduationCap, Plus, Trash2, Pencil, BookOpenCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlanner } from "@/lib/planner";
import { dateKey, topicStatuses, type Exam, type TopicStatus } from "@/lib/study";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/exams")({
  head: () => pageHead("Exam Tracker", "Keep track of exam dates and the topics you want to revise."),
  component: ExamTracker,
});

function ExamDialog({ exam }: { exam?: Exam }) {
  const { subjects, saveExam } = usePlanner();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(exam?.title ?? "");
  const [subjectId, setSubjectId] = useState(exam?.subjectId ?? subjects[0]?.id ?? "");
  const [date, setDate] = useState(exam?.date ?? dateKey());
  const [error, setError] = useState("");
  return <Dialog open={open} onOpenChange={value => {
    setOpen(value);
    if (value) { setTitle(exam?.title ?? ""); setSubjectId(exam?.subjectId ?? subjects[0]?.id ?? ""); setDate(exam?.date ?? dateKey()); setError(""); }
  }}>
    <DialogTrigger asChild><Button variant={exam ? "outline" : "default"} size={exam ? "icon" : "default"} aria-label={exam ? "Edit exam" : undefined} disabled={!subjects.length}>{exam ? <Pencil className="size-4" /> : <><Plus className="size-4" /> Add exam</>}</Button></DialogTrigger>
    <DialogContent><DialogHeader><DialogTitle>{exam ? "Edit exam" : "Add an exam"}</DialogTitle></DialogHeader>
      <form className="space-y-4" onSubmit={e => {
        e.preventDefault();
        if (!title.trim() || !subjects.some(s => s.id === subjectId) || !date) { setError("Please fill in all the fields."); return; }
        saveExam({ title: title.trim(), subjectId, date, topics: exam?.topics ?? [] }, exam?.id);
        setOpen(false);
      }}>
        <div className="space-y-2"><Label htmlFor="exam-title">Exam name</Label><Input id="exam-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Information Security" required maxLength={100} /></div>
        <div className="space-y-2"><Label>Subject</Label><Select value={subjectId} onValueChange={setSubjectId}><SelectTrigger><SelectValue placeholder="Choose a subject" /></SelectTrigger><SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.emoji} {s.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="exam-date">Exam date</Label><Input id="exam-date" type="date" min={dateKey()} value={date} onChange={e => setDate(e.target.value)} required /></div>
        {error && <p className="text-sm text-destructive">{error}</p>}<Button type="submit" className="w-full">Save exam</Button>
      </form>
    </DialogContent>
  </Dialog>;
}

function ExamTracker() {
  const { subjects, exams, saveExam, removeExam, addTopic, updateTopic, removeTopic } = usePlanner();
  const [topicDrafts, setTopicDrafts] = useState<Record<string, string>>({});
  const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date));
  return <div className="space-y-8">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Exam Tracker 🎓</h1><p className="mt-1 text-muted-foreground">Know what’s coming up and take revision one topic at a time.</p></div><ExamDialog /></div>
    {!subjects.length && <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">Add a subject first, then you can attach exams to it.</p>}
    {!sorted.length && subjects.length > 0 && <div className="rounded-2xl border border-dashed p-10 text-center"><GraduationCap className="mx-auto size-10 text-primary" /><h2 className="mt-3 text-lg font-semibold">Your exam plan starts here</h2><p className="mt-1 text-sm text-muted-foreground">Add your next exam, then list the topics you want to revise.</p><div className="mt-4"><ExamDialog /></div></div>}
    <div className="grid gap-5 lg:grid-cols-2">{sorted.map(exam => {
      const subject = subjects.find(s => s.id === exam.subjectId);
      const remaining = Math.max(0, exam.topics.length - exam.topics.filter(t => t.status === "confident").length);
      const days = Math.round((new Date(`${exam.date}T00:00:00`).getTime() - new Date(`${dateKey()}T00:00:00`).getTime()) / 86400000);
      return <Card key={exam.id} className="space-y-5 p-5 shadow-soft">
        <div className="flex items-start gap-3"><div className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-2xl">{subject?.emoji ?? "📚"}</div><div className="min-w-0 flex-1"><h2 className="font-display text-xl font-bold">{exam.title}</h2><p className="text-sm text-muted-foreground">{subject?.name} · {format(parseISO(exam.date), "d MMM yyyy")}</p></div><ExamDialog exam={exam} /><Button variant="ghost" size="icon" aria-label="Delete exam" onClick={() => { if (confirm(`Delete ${exam.title}?`)) removeExam(exam.id); }}><Trash2 className="size-4" /></Button></div>
        <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3"><CalendarDays className="size-5 text-primary" /><div><p className="font-semibold">{days === 0 ? "Your exam is today" : days < 0 ? "Exam date has passed" : `${days} days to go`}</p><p className="text-xs text-muted-foreground">{exam.topics.length} topics · {remaining} still to review</p></div></div>
        <div className="space-y-3"><h3 className="flex items-center gap-2 font-semibold"><BookOpenCheck className="size-4" /> Revision topics</h3>
          {exam.topics.map(topic => <div key={topic.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-3"><span className="min-w-0 flex-1 break-words text-sm">{topic.title}</span><Select value={topic.status} onValueChange={value => updateTopic(exam.id, topic.id, value as TopicStatus)}><SelectTrigger className="w-[175px]"><SelectValue /></SelectTrigger><SelectContent>{topicStatuses.map(status => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}</SelectContent></Select><Button size="icon" variant="ghost" aria-label={`Remove ${topic.title}`} onClick={() => removeTopic(exam.id, topic.id)}><Trash2 className="size-4" /></Button></div>)}
          {!exam.topics.length && <p className="text-sm text-muted-foreground">Add a few topics you want to revise for this exam.</p>}
          <form className="flex gap-2" onSubmit={e => { e.preventDefault(); const title = (topicDrafts[exam.id] ?? "").trim(); if (title) { addTopic(exam.id, title); setTopicDrafts(p => ({ ...p, [exam.id]: "" })); } }}><Input aria-label="New revision topic" value={topicDrafts[exam.id] ?? ""} onChange={e => setTopicDrafts(p => ({ ...p, [exam.id]: e.target.value }))} placeholder="Add a topic to revise…" maxLength={120} /><Button type="submit" variant="secondary" disabled={!(topicDrafts[exam.id] ?? "").trim()}><Plus className="size-4" /> Add</Button></form>
        </div>
      </Card>;
    })}</div>
  </div>;
}
