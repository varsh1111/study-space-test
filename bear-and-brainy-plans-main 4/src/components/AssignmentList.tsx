import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlanner, dueLabel, daysUntil, subjectColor, type Assignment } from "@/lib/planner";

export function AssignmentRow({ a, showSubject }: { a: Assignment; showSubject?: boolean }) {
  const { subjects, toggleAssignment, removeAssignment } = usePlanner();
  const sub = subjects.find((s) => s.id === a.subjectId);
  const d = daysUntil(a.due);
  const tone = a.done ? "text-muted-foreground" : d < 0 ? "text-destructive" : d <= 2 ? "text-accent" : "text-muted-foreground";
  return (
    <div className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
      <Checkbox checked={a.done} onCheckedChange={() => toggleAssignment(a.id)} aria-label={`Mark ${a.title} done`} />
      <div className="min-w-0 flex-1">
        <p className={`truncate font-medium ${a.done ? "text-muted-foreground line-through" : ""}`}>{a.title}</p>
        <p className="flex items-center gap-2 text-xs">
          {showSubject && sub && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <span className="size-2 rounded-full" style={{ background: subjectColor(sub.color) }} />{sub.name} ·
            </span>
          )}
          <span className={`font-semibold ${tone}`}>{a.done ? "Completed" : dueLabel(a.due)}</span>
        </p>
      </div>
      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" onClick={() => removeAssignment(a.id)} aria-label="Delete">
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function AddAssignmentForm({ subjectId }: { subjectId?: string }) {
  const { subjects, addAssignment } = usePlanner();
  const [title, setTitle] = useState("");
  const [due, setDue] = useState(new Date().toISOString().slice(0, 10));
  const [sid, setSid] = useState(subjectId ?? subjects[0]?.id ?? "");
  const validSid = subjects.some((s) => s.id === sid) ? sid : subjects[0]?.id ?? "";
  const target = subjectId ?? validSid;
  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim() || !target) return;
        addAssignment({ title: title.trim(), due, subjectId: target });
        setTitle("");
      }}
    >
      <Input className="min-w-48 flex-1" placeholder="New assignment or deadline…" value={title} onChange={(e) => setTitle(e.target.value)} />
      {!subjectId && (
        <Select value={validSid} onValueChange={setSid}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>
            {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.emoji} {s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
      <Input type="date" className="w-40" value={due} onChange={(e) => setDue(e.target.value)} />
      <Button type="submit" disabled={!title.trim() || !target}><Plus />Add</Button>
    </form>
  );
}
