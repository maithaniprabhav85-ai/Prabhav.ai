import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/crm/AppLayout";
import { EmptyState, StatCard } from "@/components/crm/bits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCrm } from "@/lib/crm/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — InternLead CRM" },
      { name: "description", content: "Founder-only overview of intern workload, follow-up completion and conversion performance across the pipeline." },
      { property: "og:title", content: "Admin Panel — InternLead CRM" },
      { property: "og:description", content: "Compare intern workload and conversions in one founder view." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { allStats, leads, followUps, settings } = useCrm();

  if (settings.role !== "Founder") {
    return (
      <>
        <PageHeader title="Admin Panel" />
        <EmptyState title="Founder access only" body="Switch your role to Founder in Settings to view this page." />
        <Button asChild className="mt-4"><Link to="/settings">Open settings</Link></Button>
      </>
    );
  }

  const converted = leads.filter((l) => l.status === "Converted").length;

  return (
    <>
      <PageHeader title="Admin Panel" subtitle={`${settings.companyName} · founder view`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Interns" value={allStats.length} icon={ShieldCheck} />
        <StatCard label="Total leads" value={leads.length} />
        <StatCard label="Follow-ups logged" value={followUps.length} />
        <StatCard label="Conversions" value={converted} hint={`${leads.length ? Math.round((converted / leads.length) * 100) : 0}% win rate`} />
      </div>

      <section className="surface-card mt-6 overflow-hidden">
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold text-navy">Intern leaderboard</h2>
        </div>
        <ul className="divide-y">
          {[...allStats]
            .sort((a, b) => b.converted - a.converted || b.followUpRate - a.followUpRate)
            .map((s, i) => (
              <li key={s.intern.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-navy">{i + 1}</span>
                <Link
                  to="/interns/$internId"
                  params={{ internId: s.intern.id }}
                  className="min-w-0 flex-1 text-sm font-semibold text-navy hover:text-primary"
                >
                  {s.intern.name}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {s.assigned} leads · {s.completedFollowUps} follow-ups · {s.converted} converted · {s.hours}h
                </span>
                <div className="flex w-40 items-center gap-2">
                  <Progress value={s.followUpRate} className="h-1.5" />
                  <span className="w-9 text-right text-xs font-semibold text-primary">{s.followUpRate}%</span>
                </div>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
