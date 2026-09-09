import { Pause, Play, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCrm } from "@/lib/crm/context";

function elapsed(startIso: string, now: number) {
  const ms = Math.max(0, now - new Date(startIso).getTime());
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function WorkTimer({ todayHours, totalHours }: { todayHours: number; totalHours: number }) {
  const { activeSession, startWork, stopWork } = useCrm();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!activeSession) {
      setNow(null);
      return;
    }
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [activeSession]);

  return (
    <section className="surface-card mt-6 p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-navy text-navy-foreground">
            <Timer className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-navy">Working hours</h2>
            <p className="text-xs text-muted-foreground">
              {activeSession && now ? `Running · ${elapsed(activeSession.start, now)}` : "Timer stopped"}
            </p>
          </div>
        </div>
        {activeSession ? (
          <Button
            variant="outline"
            onClick={() => {
              stopWork();
              toast.success("Working session saved");
            }}
          >
            <Pause className="size-4" /> Stop working
          </Button>
        ) : (
          <Button
            onClick={() => {
              startWork();
              toast.success("Working session started");
            }}
          >
            <Play className="size-4" /> Start working
          </Button>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Today</p>
          <p className="text-lg font-bold text-navy">{todayHours}h</p>
        </div>
        <div className="rounded-xl bg-muted px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Total</p>
          <p className="text-lg font-bold text-navy">{totalHours}h</p>
        </div>
      </div>
    </section>
  );
}
