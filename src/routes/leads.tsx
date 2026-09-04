import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import { useCrm } from "@/lib/crm/store";
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
  const { leads, interns, deleteLead, settings } = useCrm();
  const [q, setQ] = useState("");
  const [intern, setIntern] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [priority, setPriority] = useState(ALL);
  const [industry, setIndustry] = useState(ALL);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const internName = (id: string) => interns.find((i) => i.id === id)?.name ?? "Unassigned";

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (term && ![l.company, l.contactPerson, l.email, l.phone, l.location].join(" ").toLowerCase().includes(term)) return false;
      if (intern !== ALL && l.internId !== intern) return false;
      if (status !== ALL && l.status !== status) return false;
      if (priority !== ALL && l.priority !== priority) return false;
      if (industry !== ALL && l.industry !== industry) return false;
      const created = l.createdAt.slice(0, 10);
      if (from && created < from) return false;
      if (to && created > to) return false;
      return true;
    });
  }, [leads, q, intern, status, priority, industry, from, to]);

  const cell = settings.compactTable ? "px-3 py-2" : "px-4 py-3";

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
        <div className={`mt-3 gap-3 sm:grid-cols-2 xl:grid-cols-6 ${showFilters ? "grid" : "hidden"}`}>
          <FilterSelect label="Intern" value={intern} onChange={setIntern} options={interns.map((i) => ({ value: i.id, label: i.name }))} />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))} />
          <FilterSelect label="Priority" value={priority} onChange={setPriority} options={LEAD_PRIORITIES.map((p) => ({ value: p, label: p }))} />
          <FilterSelect label="Industry" value={industry} onChange={setIndustry} options={INDUSTRIES.map((i) => ({ value: i, label: i }))} />
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Created from
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Created to
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No leads match these filters" body="Try clearing search or date range." />
      ) : (
        <div className="surface-card overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
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
                  <td className={`${cell} text-xs text-muted-foreground`}>{new Date(l.createdAt).toLocaleString()}</td>
                  <td className={cell}>
                    <div className="flex justify-end gap-1">
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
