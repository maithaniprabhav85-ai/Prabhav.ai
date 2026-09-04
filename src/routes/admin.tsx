import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/crm/AppLayout";
import { EmptyState, StatCard } from "@/components/crm/bits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCrm } from "@/lib/crm/store";
import { LEAD_STATUSES } from "@/lib/crm/types";

const ALL = "all";

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
  const [showFilters, setShowFilters] = useState(false);
  const [internFilter, setInternFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [sortBy, setSortBy] = useState("converted");

  if (settings.role !== "Founder") {
    return (
      <>
        <PageHeader title="Admin Panel" />
        <EmptyState title="Founder access only" body="Switch your role to Founder in Settings to view this page." />
        <Button asChild className="mt-4"><Link to="/settings">Open settings</Link></Button>
      </>
    );
  }

  const visibleStats = allStats.filter((s) => internFilter === ALL || s.intern.id === internFilter);
  const visibleLeads = leads.filter(
    (l) => (internFilter === ALL || l.internId === internFilter) && (statusFilter === ALL || l.status === statusFilter),
  );
  const visibleFollowUps = followUps.filter((f) => internFilter === ALL || f.internId === internFilter);
  const converted = visibleLeads.filter((l) => l.status === "Converted").length;
  const activeFilters = [internFilter, statusFilter].filter((v) => v !== ALL).length;
  const sorted = [...visibleStats].sort((a, b) =>
    sortBy === "converted"
      ? b.converted - a.converted || b.followUpRate - a.followUpRate
      : sortBy === "followUpRate"
        ? b.followUpRate - a.followUpRate
        : sortBy === "assigned"
          ? b.assigned - a.assigned
          : b.hours - a.hours,
  );

  return (
    <>
      <PageHeader
        title="Admin Panel"
        subtitle={`${settings.companyName} · founder view`}
        action={
          <div className="flex gap-2">
            <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters((v) => !v)}>
              <SlidersHorizontal className="size-4" /> Filters{activeFilters ? ` (${activeFilters})` : ""}
            </Button>
            {activeFilters > 0 && (
              <Button
                variant="ghost"
                onClick={() => {
                  setInternFilter(ALL);
                  setStatusFilter(ALL);
                }}
              >
                <X className="size-4" /> Clear
              </Button>
            )}
          </div>
        }
      />

      {showFilters && (
        <div className="surface-card mb-5 grid gap-3 p-4 sm:grid-cols-3">
          <FilterSelect
            label="Intern"
            value={internFilter}
            onChange={setInternFilter}
            options={allStats.map((s) => ({ value: s.intern.id, label: s.intern.name }))}
          />
          <FilterSelect label="Lead status" value={statusFilter} onChange={setStatusFilter} options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))} />
          <FilterSelect
            label="Sort leaderboard by"
            value={sortBy}
            onChange={setSortBy}
            includeAll={false}
            options={[
              { value: "converted", label: "Conversions" },
              { value: "followUpRate", label: "Follow-up rate" },
              { value: "assigned", label: "Assigned leads" },
              { value: "hours", label: "Working hours" },
            ]}
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Interns" value={visibleStats.length} icon={ShieldCheck} />
        <StatCard label="Total leads" value={visibleLeads.length} />
        <StatCard label="Follow-ups logged" value={visibleFollowUps.length} />
        <StatCard label="Conversions" value={converted} hint={`${visibleLeads.length ? Math.round((converted / visibleLeads.length) * 100) : 0}% win rate`} />
      </div>

      <section className="surface-card mt-6 overflow-hidden">
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold text-navy">Intern leaderboard</h2>
        </div>
        <ul className="divide-y">
          {sorted
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
  includeAll = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  includeAll?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {includeAll && <SelectItem value={ALL}>All</SelectItem>}
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </label>
  );
}
