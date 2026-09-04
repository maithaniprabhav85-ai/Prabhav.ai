import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, CheckCircle2, Percent, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/crm/AppLayout";
import { EmptyState, PriorityPill, StatCard, StatusPill } from "@/components/crm/bits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCrm } from "@/lib/crm/context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — InternLead CRM" },
      {
        name: "description",
        content: "Live snapshot of leads, contacted accounts, follow-up rate and conversions across your intern team.",
      },
      { property: "og:title", content: "Dashboard — InternLead CRM" },
      { property: "og:description", content: "Leads, follow-ups, conversions and intern performance at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { leads, activities, allStats, followUps } = useCrm();
  const today = new Date().toISOString().slice(0, 10);

  const contacted = leads.filter((l) => l.status !== "New").length;
  const converted = leads.filter((l) => l.status === "Converted").length;
  const pending = leads.filter((l) => l.nextFollowUp).length;
  const overdue = leads.filter((l) => l.nextFollowUp && l.nextFollowUp < today).length;
  const target = leads.length * 2 || 1;
  const followUpRate = Math.min(100, Math.round((followUps.length / target) * 100));

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Team-wide pipeline health and intern performance"
        action={
          <Button asChild>
            <Link to="/leads">Open leads</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total leads" value={leads.length} icon={Users} hint={`${leads.length - contacted} still untouched`} />
        <StatCard label="Contacted" value={contacted} icon={CheckCircle2} hint="Moved past New" />
        <StatCard label="Follow-ups due" value={pending} icon={CalendarClock} hint={`${overdue} overdue`} />
        <StatCard label="Converted" value={converted} icon={TrendingUp} hint={`${leads.length ? Math.round((converted / leads.length) * 100) : 0}% win rate`} />
        <StatCard label="Follow-up %" value={`${followUpRate}%`} icon={Percent} progress={followUpRate} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <section className="surface-card lg:col-span-3">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-navy">Intern performance</h2>
          </div>
          <div className="divide-y">
            {allStats.map((s) => (
              <Link
                key={s.intern.id}
                to="/interns/$internId"
                params={{ internId: s.intern.id }}
                className="block px-5 py-4 transition-colors hover:bg-muted/60"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-navy">{s.intern.code}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.assigned} leads · {s.converted} converted · {s.hours}h
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <Progress value={s.followUpRate} className="h-1.5" />
                  <span className="w-10 text-right text-xs font-semibold text-primary">{s.followUpRate}%</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="surface-card lg:col-span-2">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-navy">Recent activity</h2>
          </div>
          {activities.length === 0 ? (
            <EmptyState title="No activity yet" />
          ) : (
            <ul className="divide-y">
              {activities.slice(0, 7).map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <p className="text-sm text-foreground">{a.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="surface-card mt-6 overflow-hidden">
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold text-navy">Hot pipeline</h2>
        </div>
        <ul className="divide-y">
          {leads
            .filter((l) => l.priority === "Hot")
            .slice(0, 5)
            .map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-navy">{l.company}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.contactPerson} · {l.industry} · {l.location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityPill priority={l.priority} />
                  <StatusPill status={l.status} />
                </div>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
