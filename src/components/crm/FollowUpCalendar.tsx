import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Lead } from "@/lib/crm/types";

const dateKey = (date: Date) => date.toISOString().slice(0, 10);

export function FollowUpCalendar({ leads }: { leads: Lead[] }) {
  const initial = leads.find((lead) => lead.nextFollowUp)?.nextFollowUp;
  const [month, setMonth] = useState(() => {
    const d = initial ? new Date(`${initial}T12:00:00`) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const counts = useMemo(() => {
    const result = new Map<string, number>();
    for (const lead of leads) {
      if (lead.nextFollowUp) result.set(lead.nextFollowUp, (result.get(lead.nextFollowUp) ?? 0) + 1);
    }
    return result;
  }, [leads]);
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + days }, (_, index) => (index < firstDay ? null : index - firstDay + 1));

  const move = (delta: number) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));

  return (
    <section className="surface-card mt-4 overflow-hidden p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" size="icon" aria-label="Previous month" onClick={() => move(-1)}><ChevronLeft className="size-4" /></Button>
        <h2 className="text-base font-semibold text-navy">{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2>
        <Button variant="outline" size="icon" aria-label="Next month" onClick={() => move(1)}><ChevronRight className="size-4" /></Button>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => <div key={day} className="py-2">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 overflow-hidden rounded-xl border bg-card">
        {cells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="min-h-16 border-b border-r bg-muted/20 sm:min-h-24" />;
          const key = dateKey(new Date(month.getFullYear(), month.getMonth(), day, 12));
          const count = counts.get(key) ?? 0;
          return (
            <div key={key} className="min-h-16 border-b border-r p-2 transition-colors hover:bg-muted/40 sm:min-h-24">
              <span className="text-xs font-medium text-foreground">{day}</span>
              {count > 0 && <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-primary sm:text-xs"><span className="size-2 rounded-full bg-primary" />{count}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}