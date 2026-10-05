import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useCrm } from "@/lib/crm/context";

export function LeaderboardTargets() {
  const { allStats, setMonthlyTarget } = useCrm();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  return (
    <section className="surface-card mt-4 overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>{["Intern", "Leads handled", "Converted", "On-time follow-ups", "Monthly target", "Progress"].map((label) => <th key={label} className="px-5 py-3 font-semibold">{label}</th>)}</tr>
        </thead>
        <tbody className="divide-y">
          {allStats.map((stats) => {
            const progress = Math.min(100, Math.round((stats.converted / stats.monthlyTarget) * 100));
            return (
              <tr key={stats.intern.id} className="transition-colors hover:bg-muted/40">
                <td className="px-5 py-4 font-semibold text-navy">{stats.intern.code} · {stats.intern.name}</td>
                <td className="px-5 py-4">{stats.assigned}</td>
                <td className="px-5 py-4">{stats.converted}</td>
                <td className="px-5 py-4">{stats.onTimeFollowUps}</td>
                <td className="px-5 py-4">
                  <Input
                    className="w-24"
                    type="number"
                    min={1}
                    value={drafts[stats.intern.id] ?? String(stats.monthlyTarget)}
                    onChange={(event) => setDrafts((current) => ({ ...current, [stats.intern.id]: event.target.value }))}
                    onBlur={(event) => setMonthlyTarget(stats.intern.id, Number(event.target.value) || 1)}
                    aria-label={`Monthly target for ${stats.intern.code}`}
                  />
                </td>
                <td className="px-5 py-4"><div className="flex items-center gap-3"><Progress value={progress} className="h-2" /><span className="w-10 text-xs font-semibold text-primary">{progress}%</span></div></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}