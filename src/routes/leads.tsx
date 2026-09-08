import { formatDateTime } from "@/lib/format";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Archive, ArchiveRestore, Check, Download, Pencil, Plus, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/crm/AppLayout";
import { EmptyState, PriorityPill, StatusPill } from "@/components/crm/bits";
import { LeadDialog } from "@/components/crm/LeadDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCrm } from "@/lib/crm/context";
import { downloadLeadPdf } from "@/lib/crm/leadPdf";
import { QUICK_RANGES, quickRange } from "@/lib/crm/quickRange";
import { INDUSTRIES, LEAD_PRIORITIES, LEAD_STATUSES } from "@/lib/crm/types";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title: "Leads — InternLead CRM" },
      { name: "description", content: "Searchable lead table with status, priority, industry and intern filters plus add, edit and delete." },
      { property: "og:title", content: "Leads — InternLead CRM" },
      { property: "og:description", content: "Manage every lead with rich filters and quick edits." },
    ],
  }),
  component: Leads,
});

const ALL = "all";

function Leads() {
  const { allLeads, interns, deleteLead, archiveLead, settings } = useCrm();
  const [view, setView] = useState<"active" | "archived">("active");
  const leads = useMemo(() => allLeads.filter((l) => (view === "archived" ? l.archived : !l.archived)), [allLeads, view]);
  const [q, setQ] = useState("");
  // Applied filters (drive the table) — only change when Apply is clicked.
  const [intern, setIntern] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [priority, setPriority] = useState(ALL);
  const [industry, setIndustry] = useState(ALL);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minHours, setMinHours] = useState("");
  const [maxHours, setMaxHours] = useState("");
  // Draft filters (bound to the inputs until Apply).
  const [dIntern, setDIntern] = useState(ALL);
  const [dStatus, setDStatus] = useState(ALL);
  const [dPriority, setDPriority] = useState(ALL);
  const [dIndustry, setDIndustry] = useState(ALL);
  const [dFrom, setDFrom] = useState("");
  const [dTo, setDTo] = useState("");
  const [dMinHours, setDMinHours] = useState("");
  const [dMaxHours, setDMaxHours] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = () => {
    setIntern(dIntern);
    setStatus(dStatus);
    setPriority(dPriority);
    setIndustry(dIndustry);
    setFrom(dFrom);
    setTo(dTo);
    setMinHours(dMinHours);
    setMaxHours(dMaxHours);
  };

  const internName = (id: string) => interns.find((i) => i.id === id)?.code ?? "Unassigned";

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (term && ![l.company, l.contactPerson, l.email, l.phone, l.location].join(" ").toLowerCase().includes(term)) return false;
      if (intern !== ALL && l.internId !== intern) return false;
      if (status !== ALL && l.status !== status) return false;
      if (priority !== ALL && l.priority !== priority) return false;
      if (industry !== ALL && l.industry !== industry) return false;
      const created = new Date(l.createdAt).getTime();
      if (from && created < new Date(from).getTime()) return false;
      if (to && created > new Date(to).getTime()) return false;
      const hours = interns.find((i) => i.id === l.internId)?.workingHours ?? 0;
      if (minHours && hours < Number(minHours)) return false;
      if (maxHours && hours > Number(maxHours)) return false;
      return true;
    });
  }, [leads, interns, q, intern, status, priority, industry, from, to, minHours, maxHours]);

  const cell = settings.compactTable ? "px-3 py-2" : "px-4 py-3";
  const activeFilters =
    [intern, status, priority, industry].filter((v) => v !== ALL).length + [from, to, minHours, maxHours].filter(Boolean).length;
  const clearFilters = () => {
    setIntern(ALL); setStatus(ALL); setPriority(ALL); setIndustry(ALL);
    setFrom(""); setTo(""); setMinHours(""); setMaxHours("");
    setDIntern(ALL); setDStatus(ALL); setDPriority(ALL); setDIndustry(ALL);
    setDFrom(""); setDTo(""); setDMinHours(""); setDMaxHours("");
  };

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle={`${filtered.length} of ${leads.length} leads`}
        action={
          <LeadDialog
            trigger={
              <Button>
                <Plus className="size-4" /> Add lead
              </Button>
            }
          />
        }
      />

      <div className="surface-card mb-5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search company, contact, email, phone or city" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters((v) => !v)}>
              <SlidersHorizontal className="size-4" /> Filters{activeFilters ? ` (${activeFilters})` : ""}
            </Button>
            {activeFilters > 0 && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="size-4" /> Clear
              </Button>
            )}
          </div>
        </div>
        <div className={`mt-3 grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 ${showFilters ? "grid" : "hidden"}`}>
          <FilterSelect label="Intern" value={dIntern} onChange={setDIntern} options={interns.map((i) => ({ value: i.id, label: i.code }))} />
          <FilterSelect label="Status" value={dStatus} onChange={setDStatus} options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))} />
          <FilterSelect label="Priority" value={dPriority} onChange={setDPriority} options={LEAD_PRIORITIES.map((p) => ({ value: p, label: p }))} />
          <FilterSelect label="Industry" value={dIndustry} onChange={setDIndustry} options={INDUSTRIES.map((i) => ({ value: i, label: i }))} />
          <label className="grid min-w-0 gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Created from (date & time)
            <Input className="w-full min-w-0" type="datetime-local" value={dFrom} onChange={(e) => setDFrom(e.target.value)} />
          </label>
          <label className="grid min-w-0 gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Created to (date & time)
            <Input className="w-full min-w-0" type="datetime-local" value={dTo} onChange={(e) => setDTo(e.target.value)} />
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Min intern hours
            <Input type="number" min={0} value={dMinHours} onChange={(e) => setDMinHours(e.target.value)} placeholder="0" />
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Max intern hours
            <Input type="number" min={0} value={dMaxHours} onChange={(e) => setDMaxHours(e.target.value)} placeholder="Any" />
          </label>
        </div>
        {showFilters && (
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
                    setDFrom(f); setDTo(t); setFrom(f); setTo(t);
                  }}
                >
                  {r.label}
                </Button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="size-4" /> Reset filters
            </Button>
            <Button size="sm" onClick={applyFilters}>
              <Check className="size-4" /> Apply filters
            </Button>
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No leads found" body="No leads match your search or filters. Try Reset filters to see everything." />
      ) : (
        <div className="surface-card overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {["Company", "Contact", "Industry", "Status", "Priority", "Intern", "Next follow-up", "Created", ""].map((h) => (
                  <th key={h} className={`${cell} font-semibold`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((l) => (
                <tr key={l.id} className="transition-colors hover:bg-muted/40">
                  <td className={cell}>
                    <p className="font-semibold text-navy">{l.company}</p>
                    <p className="text-xs text-muted-foreground">{l.location}</p>
                  </td>
                  <td className={cell}>
                    <p>{l.contactPerson}</p>
                    <p className="text-xs text-muted-foreground">{l.email}</p>
                    <p className="text-xs text-muted-foreground">{l.phone}</p>
                  </td>
                  <td className={cell}>{l.industry}</td>
                  <td className={cell}><StatusPill status={l.status} /></td>
                  <td className={cell}><PriorityPill priority={l.priority} /></td>
                  <td className={cell}>{internName(l.internId)}</td>
                  <td className={cell}>{l.nextFollowUp || "—"}</td>
                  <td className={`${cell} text-xs text-muted-foreground`}>{formatDateTime(l.createdAt)}</td>
                  <td className={cell}>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Download ${l.company} as PDF`}
                        onClick={() => {
                          const ok = downloadLeadPdf(l, internName(l.internId));
                          if (ok) toast.success(`Preparing PDF for ${l.company}`);
                          else toast.error("Allow pop-ups to download the PDF");
                        }}
                      >
                        <Download className="size-4" />
                      </Button>
                      <LeadDialog
                        lead={l}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label={`Edit ${l.company}`}>
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Delete ${l.company}`}>
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {l.company}?</AlertDialogTitle>
                            <AlertDialogDescription>This removes the lead from the demo data.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                deleteLead(l.id);
                                toast.success("Lead deleted");
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </label>
  );
}
