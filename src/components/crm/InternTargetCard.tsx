import { Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { InternStats } from "@/lib/crm/context";

export function InternTargetCard({ stats }: { stats: InternStats }) {
  const progress = Math.min(100, Math.round((stats.converted / stats.monthlyTarget) * 100));
  return (
    <section className="surface-card mt-6 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Monthly conversion target</p>
          <p className="mt-1 text-lg font-bold text-navy">{stats.converted} of {stats.monthlyTarget}</p>
        </div>
        <Target className="size-6 text-primary" />
      </div>
      <Progress value={progress} className="mt-4 h-2" />
      <p className="mt-2 text-xs text-muted-foreground">{progress}% complete · {stats.onTimeFollowUps} follow-ups completed on time</p>
    </section>
  );
}