import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/crm/AppLayout";
import { EmptyState, PriorityPill, StatusPill } from "@/components/crm/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCrm } from "@/lib/crm/store";
import type { Lead } from "@/lib/crm/types";

export const Route = createFileRoute("/follow-ups")({
  head: () => ({
    meta: [
      { title: "Follow-ups — InternLead CRM" },
      { name: "description", content: "Overdue, today and upcoming follow-ups with one-tap complete or reschedule." },
      { property: "og:title", content: "Follow-ups — InternLead CRM" },
      { property: "og:description", content: "Never miss a lead touchpoint: overdue, today and upcoming queues." },
    ],
  }),
  component: FollowUps,
});

function FollowUps() {
  const { leads } = useCrm();
  const today = new Date().toISOString().slice(0, 10);
  const due = leads.filter((l) => l.nextFollowUp);

  const overdue = due.filter((l) => l.nextFollowUp < today);
  const now = due.filter((l) => l.nextFollowUp === today);
  const upcoming = due.filter((l) => l.nextFollowUp > today).sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp));

  return (
    <>
      <PageHeader title="Follow-ups" subtitle={`${due.length} scheduled touchpoints`} />
      <Tabs defaultValue="overdue">
        <TabsList>
          <TabsTrigger value="overdue">Overdue ({overdue.length})</TabsTrigger>
          <TabsTrigger value="today">Today ({now.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="overdue"><List leads={overdue} empty="Nothing overdue — great work." /></TabsContent>
        <TabsContent value="today"><List leads={now} empty="No follow-ups scheduled for today." /></TabsContent>
        <TabsContent value="upcoming"><List leads={upcoming} empty="No upcoming follow-ups." /></TabsContent>
      </Tabs>
    </>
  );
}

function List({ leads, empty }: { leads: Lead[]; empty: string }) {
  const { interns, completeFollowUp, rescheduleFollowUp } = useCrm();
  if (leads.length === 0) return <div className="mt-4"><EmptyState title={empty} /></div>;

  return (
    <div className="mt-4 grid gap-3">
      {leads.map((l) => (
        <div key={l.id} className="surface-card flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-navy">{l.company}</p>
              <StatusPill status={l.status} />
              <PriorityPill priority={l.priority} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {l.contactPerson} · {interns.find((i) => i.id === l.internId)?.code ?? "Unassigned"} · due {l.nextFollowUp}
            </p>
            {l.notes && <p className="mt-1 text-xs text-muted-foreground">{l.notes}</p>}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                completeFollowUp(l.id);
                toast.success(`Follow-up logged for ${l.company}`);
              }}
            >
              Complete
            </Button>
            <Reschedule leadId={l.id} current={l.nextFollowUp} company={l.company} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Reschedule({ leadId, current, company }: { leadId: string; current: string; company: string }) {
  const { rescheduleFollowUp } = useCrm();
  const [date, setDate] = useState(current);
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">Reschedule</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3">
        <p className="text-sm font-semibold text-navy">New date</p>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Button
          size="sm"
          className="w-full"
          onClick={() => {
            if (!date) return;
            rescheduleFollowUp(leadId, date);
            toast.success(`${company} moved to ${date}`);
            setOpen(false);
          }}
        >
          Save
        </Button>
      </PopoverContent>
    </Popover>
  );
}
