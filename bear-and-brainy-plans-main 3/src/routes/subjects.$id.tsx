import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlanner, progressOf, subjectColor } from "@/lib/planner";
import { AssignmentRow, AddAssignmentForm } from "@/components/AssignmentList";
import { SubjectStudyProgress, SessionDialog, SessionList } from "@/components/StudyWidgets";

export const Route = createFileRoute("/subjects/$id")({
  head: () => ({
    meta: [
      { title: "Subject — Study Space Study Planner" },
      { name: "description", content: "Manage assignments and track progress for this subject." },
      { property: "og:title", content: "Subject — Study Space Study Planner" },
      { property: "og:description", content: "Manage assignments and track progress for this subject." },
    ],
  }),
  component: SubjectPage,
});

function SubjectPage() {
  const { id } = Route.useParams();
  const { subjects, assignments, removeSubject } = usePlanner();
  const nav = useNavigate();
  const s = subjects.find((x) => x.id === id);
  if (!s) return <p className="text-muted-foreground">Subject not found. <Link to="/" className="underline">Back to dashboard</Link></p>;

  const list = assignments.filter((a) => a.subjectId === id).sort((a, b) => Number(a.done) - Number(b.done) || a.due.localeCompare(b.due));
  const p = progressOf(list);

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center gap-6 rounded-3xl border bg-card p-8 shadow-soft">
        <div className="grid size-20 place-items-center rounded-2xl text-4xl" style={{ background: `color-mix(in oklab, ${subjectColor(s.color)} 20%, transparent)` }}>{s.emoji}</div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{s.name}</h1>
          <p className="text-muted-foreground">{list.filter((a) => a.done).length} of {list.length} tasks done</p>
          <div className="mt-3 h-3 max-w-sm overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full transition-all" style={{ width: `${p}%`, background: subjectColor(s.color) }} />
          </div>
        </div>
        <div className="font-display text-5xl font-bold" style={{ color: subjectColor(s.color) }}>{p}%</div>
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-xl font-bold">Study time & progress</h2><p className="text-sm text-muted-foreground">Track the time you spend learning this subject.</p></div>
          <SessionDialog subjectId={id} />
        </div>
        <SubjectStudyProgress subjectId={id} />
        <div className="border-t pt-4"><h3 className="mb-3 font-semibold">Study sessions</h3><SessionList subjectId={id} /></div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Assignments & deadlines</h2>
        <AddAssignmentForm subjectId={id} />
        <div className="space-y-2">
          {list.length === 0 && <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">No assignments yet — add your first one above.</p>}
          {list.map((a) => <AssignmentRow key={a.id} a={a} />)}
        </div>
      </section>

      <Button variant="ghost" className="text-destructive" onClick={() => { if (confirm(`Delete ${s.name} and its assignments?`)) { removeSubject(id); nav({ to: "/" }); } }}>
        <Trash2 />Delete subject
      </Button>
    </div>
  );
}
