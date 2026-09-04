import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/crm/AppLayout";
import { EmptyState, PriorityPill, StatCard, StatusPill } from "@/components/crm/bits";
import { Button } from "@/components/ui/button";
import { useCrm } from "@/lib/crm/context";

export const Route = createFileRoute("/interns/$internId")({
  head: () => ({
    meta: [
      { title: "Intern profile — InternLead CRM" },
      { name: "description", content: "Intern profile with start date, working hours, assigned leads, follow-up rate and lead activity." },
      { property: "og:title", content: "Intern profile — InternLead CRM" },
      { property: "og:description", content: "Performance, hours and lead activity for a single intern." },
    ],
  }),
  component: InternProfile,
});

function InternProfile() {
  const { internId } = Route.useParams();
  const { internStats, leads, activities, data } = useCrm();
  const stats = internStats(internId);

  if (!stats) {
    return (
      <>
        <PageHeader title="Intern not found" />
        <EmptyState title="This profile does not exist" body="Pick an intern from the profiles list." />
        <Button asChild className="mt-4"><Link to="/interns">Back to profiles</Link></Button>
      </>
    );
  }

  const { intern } = stats;
  const myLeads = leads.filter((l) => l.internId === internId);
  const myActivity = activities.filter((a) => a.internId === internId).slice(0, 8);
  const myFollowUps = data.followUps.filter((f) => f.internId === internId);

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
        <Link to="/interns"><ArrowLeft className="size-4" /> All profiles</Link>
      </Button>
      <PageHeader title={intern.code} subtitle={`${intern.name} · ${intern.email} · ${intern.phone} · started ${intern.startDate}`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Assigned leads" value={stats.assigned} />
        <StatCard label="Follow-ups done" value={stats.completedFollowUps} />
        <StatCard label="Follow-up %" value={`${stats.followUpRate}%`} progress={stats.followUpRate} />
        <StatCard label="Converted" value={stats.converted} />
        <StatCard label="Working hours" value={`${stats.hours}h`} hint="Logged since start date" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <section className="surface-card overflow-hidden lg:col-span-3">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-navy">Assigned leads</h2>
          </div>
          {myLeads.length === 0 ? (
            <EmptyState title="No leads assigned yet" />
          ) : (
            <ul className="divide-y">
              {myLeads.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="text-sm font-semibold text-navy">{l.company}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.industry} · next {l.nextFollowUp || "—"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <PriorityPill priority={l.priority} />
                    <StatusPill status={l.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface-card lg:col-span-2">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-navy">Lead activity</h2>
          </div>
          {myActivity.length === 0 ? (
            <EmptyState title="No activity yet" />
          ) : (
            <ul className="divide-y">
              {myActivity.map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <p className="text-sm">{a.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
          <p className="border-t px-5 py-3 text-xs text-muted-foreground">
            {myFollowUps.length} follow-ups logged in total
          </p>
        </section>
      </div>
    </>
  );
}
