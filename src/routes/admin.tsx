import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/crm/AppLayout";
import { EmptyState, StatCard } from "@/components/crm/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCrm } from "@/lib/crm/context";
import { LEAD_PRIORITIES, LEAD_STATUSES } from "@/lib/crm/types";
import { QUICK_RANGES, quickRange } from "@/lib/crm/quickRange";

const ALL = "all";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — LeadPilot CRM" },
      { name: "description", content: "Founder-only overview of intern workload, follow-up completion and conversion performance across the pipeline." },
      { property: "og:title", content: "Admin Panel — LeadPilot CRM" },
      { property: "og:description", content: "Compare intern workload and conversions in one founder view." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { allStats, leads, followUps, isFounder, settings, insightsFor } = useCrm();
  const [showFilters, setShowFilters] = useState(false);
  // Applied filters — only change when Apply is clicked.
  const [internFilter, setInternFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [priorityFilter, setPriorityFilter] = useState(ALL);
  const [sortBy, setSortBy] = useState("converted");
  const [minHours, setMinHours] = useState("");
  const [maxHours, setMaxHours] = useState("");
  const [fromAt, setFromAt] = useState("");
  const [toAt, setToAt] = useState("");
  // Draft filters (bound to the inputs until Apply).
  const [dIntern, setDIntern] = useState(ALL);
  const [dStatus, setDStatus] = useState(ALL);
  const [dPriority, setDPriority] = useState(ALL);
  const [dSortBy, setDSortBy] = useState("converted");
  const [dMinHours, setDMinHours] = useState("");
  const [dMaxHours, setDMaxHours] = useState("");
  const [dFromAt, setDFromAt] = useState("");
  const [dToAt, setDToAt] = useState("");

  const applyFilters = () => {
    setInternFilter(dIntern);
    setStatusFilter(dStatus);
    setPriorityFilter(dPriority);
    setSortBy(dSortBy);
    setMinHours(dMinHours);
    setMaxHours(dMaxHours);
    setFromAt(dFromAt);
    setToAt(dToAt);
  };
  const clearAll = () => {
    setInternFilter(ALL); setStatusFilter(ALL); setPriorityFilter(ALL); setMinHours(""); setMaxHours(""); setFromAt(""); setToAt("");
    setDIntern(ALL); setDStatus(ALL); setDPriority(ALL); setDMinHours(""); setDMaxHours(""); setDFromAt(""); setDToAt("");
  };

  if (!isFounder) {
    return (
      <>
        <PageHeader title="Admin Panel" />
        <EmptyState title="Founder access only" body="This panel is for the admin account only. Sign out and sign in with the admin ID to open it." />
        <Button asChild className="mt-4"><Link to="/settings">Go to settings</Link></Button>
      </>
    );
  }

  const inHours = (h: number) => (!minHours || h >= Number(minHours)) && (!maxHours || h <= Number(maxHours));
  const inRange = (iso: string) => {
    const t = new Date(iso).getTime();
    if (fromAt && t < new Date(fromAt).getTime()) return false;
    if (toAt && t > new Date(toAt).getTime()) return false;
    return true;
  };
  const visibleStats = allStats.filter((s) => (internFilter === ALL || s.intern.id === internFilter) && inHours(s.hours));
  const allowedInterns = new Set(visibleStats.map((s) => s.intern.id));
  const visibleLeads = leads.filter(
    (l) =>
      allowedInterns.has(l.internId) &&
      (statusFilter === ALL || l.status === statusFilter) &&
      (priorityFilter === ALL || l.priority === priorityFilter) &&
      inRange(l.createdAt),
  );
  const visibleFollowUps = followUps.filter((f) => allowedInterns.has(f.internId) && inRange(f.completedAt));
  const converted = visibleLeads.filter((l) => l.status === "Converted").length;
  const activeFilters =
    [internFilter, statusFilter, priorityFilter].filter((v) => v !== ALL).length + [minHours, maxHours, fromAt, toAt].filter(Boolean).length;
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
              <Button variant="ghost" onClick={clearAll}>
                <X className="size-4" /> Clear
              </Button>
            )}
          </div>
        }
      />

      {showFilters && (
        <div className="surface-card mb-5 p-4">
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            <FilterSelect
              label="Intern"
              value={dIntern}
              onChange={setDIntern}
              options={allStats.map((s) => ({ value: s.intern.id, label: s.intern.code }))}
            />
            <FilterSelect label="Lead status" value={dStatus} onChange={setDStatus} options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))} />
            <FilterSelect
              label="Lead priority"
              value={dPriority}
              onChange={setDPriority}
              allLabel="All priorities"
              options={LEAD_PRIORITIES.map((p) => ({ value: p, label: p }))}
            />
            <FilterSelect
              label="Sort leaderboard by"
              value={dSortBy}
              onChange={setDSortBy}
              includeAll={false}
              options={[
                { value: "converted", label: "Conversions" },
                { value: "followUpRate", label: "Follow-up rate" },
                { value: "assigned", label: "Assigned leads" },
                { value: "hours", label: "Working hours" },
              ]}
            />
            <Field label="Min working hours">
              <Input type="number" min={0} value={dMinHours} onChange={(e) => setDMinHours(e.target.value)} placeholder="0" />
            </Field>
            <Field label="Max working hours">
              <Input type="number" min={0} value={dMaxHours} onChange={(e) => setDMaxHours(e.target.value)} placeholder="Any" />
            </Field>
            <Field label="Activity from (date & time)">
              <Input className="w-full min-w-0" type="datetime-local" value={dFromAt} onChange={(e) => setDFromAt(e.target.value)} />
            </Field>
            <Field label="Activity to (date & time)">
              <Input className="w-full min-w-0" type="datetime-local" value={dToAt} onChange={(e) => setDToAt(e.target.value)} />
            </Field>
          </div>
          <div className="mt-3 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick</span>
              {QUICK_RANGES.map((r) => (
                <Button
                  key={r.key}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const [f, t] = quickRange(r.key);
                    setDFromAt(f); setDToAt(t); setFromAt(f); setToAt(t);
                  }}
                >
                  {r.label}
                </Button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <X className="size-4" /> Reset filters
              </Button>
              <Button size="sm" onClick={applyFilters}>
                <Check className="size-4" /> Apply filters
              </Button>
            </div>
          </div>
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
                  {s.intern.code}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {s.assigned} leads · {s.completedFollowUps} follow-ups · {s.converted} converted ({s.conversionRate}%) · {s.totalHours}h total ·{" "}
                  {s.todayHours}h today
                </span>
                <div className="flex w-40 items-center gap-2">
                  <Progress value={s.followUpRate} className="h-1.5" />
                  <span className="w-9 text-right text-xs font-semibold text-primary">{s.followUpRate}%</span>
                </div>
              </li>
            ))}
        </ul>
      </section>

      <section className="surface-card mt-6 overflow-hidden">
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold text-navy">Strengths &amp; weaknesses</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Based on follow-up, conversion, pipeline size and logged hours.</p>
        </div>
        {sorted.length === 0 ? (
          <EmptyState title="No interns match these filters" />
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {sorted.map((s) => {
              const ins = insightsFor(s.intern.id);
              return (
                <article key={s.intern.id} className="rounded-xl border bg-card p-4">
                  <h3 className="text-sm font-semibold text-navy">{s.intern.code} · {s.intern.name}</h3>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Strong areas</p>
                  <ul className="mt-1 space-y-1 text-xs text-foreground">
                    {ins.strengths.length ? ins.strengths.map((t) => <li key={t}>• {t}</li>) : <li>• No standout strengths yet</li>}
                  </ul>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-destructive">Weak areas</p>
                  <ul className="mt-1 space-y-1 text-xs text-foreground">
                    {ins.weaknesses.length ? ins.weaknesses.map((t) => <li key={t}>• {t}</li>) : <li>• Nothing to flag</li>}
                  </ul>
                </article>
              );
            })}
          </div>
        )}
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
  allLabel = "All",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  includeAll?: boolean;
  allLabel?: string;
}) {
  return (
    <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {includeAll && <SelectItem value={ALL}>{allLabel}</SelectItem>}
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </label>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
      {children}
    </label>
  );
}
