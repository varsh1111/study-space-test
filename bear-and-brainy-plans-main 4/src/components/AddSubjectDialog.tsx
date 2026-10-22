import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlanner } from "@/lib/planner";

const EMOJIS = ["📘", "📐", "🧬", "📚", "🧪", "🌍", "🎨", "🎵", "💻", "🏛️", "⚽", "🗣️"];

export function AddSubjectDialog({ children }: { children: ReactNode }) {
  const { addSubject } = usePlanner();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📘");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const s = addSubject(name.trim(), emoji);
    setName(""); setEmoji("📘"); setOpen(false);
    nav({ to: "/subjects/$id", params: { id: s.id } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader><DialogTitle>Add a new subject</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="sname">Subject name</Label>
            <Input id="sname" autoFocus placeholder="e.g. Chemistry" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Pick an icon</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((em) => (
                <button type="button" key={em} onClick={() => setEmoji(em)}
                  className={`grid size-10 place-items-center rounded-lg border text-xl transition ${emoji === em ? "border-primary bg-secondary" : "hover:bg-muted"}`}>
                  {em}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter><Button type="submit" disabled={!name.trim()}>Add subject</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
