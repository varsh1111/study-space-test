import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { usePlanner, getAchievements } from "@/lib/planner";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — Study Space Study Planner" },
      { name: "description", content: "Unlock badges as you complete assignments and stay motivated." },
      { property: "og:title", content: "Achievements — Study Space Study Planner" },
      { property: "og:description", content: "Unlock badges as you complete assignments and stay motivated." },
    ],
  }),
  component: Achievements,
});

function Achievements() {
  const list = getAchievements(usePlanner());
  const n = list.filter((a) => a.unlocked).length;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">You've unlocked {n} of {list.length} badges. Keep going! 💪</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => (
          <div key={a.id} className={`relative rounded-2xl border p-6 transition ${a.unlocked ? "bg-card shadow-soft" : "bg-muted/50 opacity-70"}`}>
            {!a.unlocked && <Lock className="absolute right-4 top-4 size-4 text-muted-foreground" />}
            <div className={`text-5xl ${a.unlocked ? "" : "grayscale"}`}>{a.emoji}</div>
            <h3 className="mt-4 text-lg font-bold">{a.title}</h3>
            <p className="text-sm text-muted-foreground">{a.desc}</p>
            <p className={`mt-3 text-xs font-bold ${a.unlocked ? "text-success" : "text-muted-foreground"}`}>{a.unlocked ? "Unlocked ✓" : a.progress}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
