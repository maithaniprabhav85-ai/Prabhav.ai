import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Plus, SlidersHorizontal, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/crm/AppLayout";
import { EmptyState } from "@/components/crm/bits";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkTimer } from "@/components/crm/WorkTimer";
import { useCrm } from "@/lib/crm/context";
import { DEPARTMENTS, DESIGNATIONS, type Intern } from "@/lib/crm/types";

export const Route = createFileRoute("/interns/")({
  head: () => ({
    meta: [
      { title: "Intern Profiles — InternLead CRM" },
      { name: "description", content: "Browse every intern with department, designation, working hours, assigned leads and follow-up performance." },
      { property: "og:title", content: "Intern Profiles — InternLead CRM" },
      { property: "og:description", content: "Manage intern profiles: add, update or remove team members." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Interns,
});

const ALL = "all";
const emptyFilters = { department: ALL, designation: ALL, minHours: "", maxHours: "", q: "", sort: "code" };
type Filters = typeof emptyFilters;

function Interns() {
  const { allStats, isFounder, deleteIntern, currentIntern } = useCrm();
  const myStats = currentIntern ? allStats.find((s) => s.intern.id === currentIntern.id) : undefined;
  const [showFilters, setShowFilters] = useState(false);
  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters>(emptyFilters);

  const activeCount =
    [applied.department, applied.designation].filter((v) => v !== ALL).length +
    [applied.minHours, applied.maxHours, applied.q].filter(Boolean).length;

  const visible = useMemo(() => {
    const term = applied.q.trim().toLowerCase();
    const rows = allStats.filter((s) => {
      const i = s.intern;
      if (term && ![i.name, i.code, i.email, i.phone].join(" ").toLowerCase().includes(term)) return false;
      if (applied.department !== ALL && i.department !== applied.department) return false;
      if (applied.designation !== ALL && i.designation !== applied.designation) return false;
      if (applied.minHours && i.workingHours < Number(applied.minHours)) return false;
      if (applied.maxHours && i.workingHours > Number(applied.maxHours)) return false;
      return true;
    });
    return rows.sort((a, b) =>
      applied.sort === "hours"
        ? b.hours - a.hours
        : applied.sort === "assigned"
          ? b.assigned - a.assigned
          : applied.sort === "converted"
            ? b.converted - a.converted
            : a.intern.code.localeCompare(b.intern.code, undefined, { numeric: true }),
    );
  }, [allStats, applied]);

  return (
    <>
      <PageHeader
        title="Intern profiles"
        subtitle={`${visible.length} of ${allStats.length} interns`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters((v) => !v)}>
              <SlidersHorizontal className="size-4" /> Filters{activeCount ? ` (${activeCount})` : ""}
            </Button>
            {isFounder && <InternDialog />}
          </div>
        }
      />

      {showFilters && (
        <div className="surface-card mb-5 grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Search name, ID, email">
            <Input value={draft.q} maxLength={60} onChange={(e) => setDraft({ ...draft, q: e.target.value })} placeholder="Search" />
          </Field>
          <FilterSelect
            label="Department"
            value={draft.department}
            onChange={(v) => setDraft({ ...draft, department: v })}
            options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
          />
          <FilterSelect
            label="Designation"
            value={draft.designation}
            onChange={(v) => setDraft({ ...draft, designation: v })}
            options={DESIGNATIONS.map((d) => ({ value: d, label: d }))}
          />
          <Field label="Min working hours">
            <Input type="number" min={0} value={draft.minHours} onChange={(e) => setDraft({ ...draft, minHours: e.target.value })} placeholder="0" />
          </Field>
          <Field label="Max working hours">
            <Input type="number" min={0} value={draft.maxHours} onChange={(e) => setDraft({ ...draft, maxHours: e.target.value })} placeholder="Any" />
          </Field>
          <FilterSelect
            label="Sort by"
            includeAll={false}
            value={draft.sort}
            onChange={(v) => setDraft({ ...draft, sort: v })}
            options={[
              { value: "code", label: "Intern ID" },
              { value: "hours", label: "Working hours" },
              { value: "assigned", label: "Assigned leads" },
              { value: "converted", label: "Conversions" },
            ]}
          />
          <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-3">
            <Button onClick={() => setApplied(draft)}>Apply filters</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setDraft(emptyFilters);
                setApplied(emptyFilters);
              }}
            >
              <X className="size-4" /> Reset
            </Button>
          </div>
        </div>
      )}

      {myStats && <div className="mb-5"><WorkTimer todayHours={myStats.todayHours} totalHours={myStats.totalHours} /></div>}

      {visible.length === 0 ? (
        <EmptyState title="No interns match these filters" body="Change the filters and press Apply again." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((s) => (
            <div key={s.intern.id} className="surface-card p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-navy-foreground">
                  {s.intern.code.replace(/[^0-9]/g, "")}
                </span>
                <div className="min-w-0 flex-1">
                  <Link to="/interns/$internId" params={{ internId: s.intern.id }} className="truncate font-semibold text-navy hover:text-primary">
                    {s.intern.code}
                  </Link>
                  <p className="truncate text-xs font-medium text-navy/70">{s.intern.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.intern.email}</p>
                </div>
                {isFounder && (
                  <div className="flex shrink-0 gap-1">
                    <InternDialog
                      intern={s.intern}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label={`Edit ${s.intern.code}`}>
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Delete ${s.intern.code}`}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove {s.intern.code}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Their leads stay in the pipeline but become unassigned.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              deleteIntern(s.intern.id);
                              toast.success(`${s.intern.code} removed`);
                            }}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
                <span className="rounded-full bg-muted px-2 py-1 text-navy">{s.intern.department}</span>
                <span className="rounded-full bg-muted px-2 py-1 text-navy">{s.intern.designation}</span>
              </div>
              <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
                <Mini label="Leads" value={s.assigned} />
                <Mini label="Won" value={s.converted} />
                <Mini label="Today" value={s.todayHours} />
                <Mini label="Hours" value={s.totalHours} />
              </dl>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Follow-up rate</span>
                    <span className="font-semibold text-primary">{s.followUpRate}%</span>
                  </div>
                  <Progress value={s.followUpRate} className="mt-1.5 h-1.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Conversion rate</span>
                    <span className="font-semibold text-primary">{s.conversionRate}%</span>
                  </div>
                  <Progress value={s.conversionRate} className="mt-1.5 h-1.5" />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Started {s.intern.startDate}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted px-2 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-base font-bold text-navy">{value}</dd>
    </div>
  );
}

function InternDialog({ intern, trigger }: { intern?: Intern; trigger?: React.ReactNode }) {
  const { addIntern, updateIntern, interns } = useCrm();
  const [open, setOpen] = useState(false);
  const blank = {
    name: "",
    department: DEPARTMENTS[0]!,
    designation: DESIGNATIONS[0]!,
    email: "",
    phone: "",
    startDate: new Date().toISOString().slice(0, 10),
    workingHours: 0,
    password: "",
  };
  const [form, setForm] = useState(intern ? { ...blank, ...intern } : blank);

  const submit = () => {
    const name = form.name.trim();
    if (!name) {
      toast.error("Name is required");
      return;
    }
    const payload = {
      name,
      department: form.department,
      designation: form.designation,
      email: form.email.trim(),
      phone: form.phone.trim(),
      startDate: form.startDate,
      workingHours: Number(form.workingHours) || 0,
      password: form.password.trim() || `intern${interns.length + 1}`,
    };
    if (intern) {
      updateIntern(intern.id, payload);
      toast.success(`${intern.code} updated`);
    } else {
      const res = addIntern(payload);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`${name} added`);
      setForm(blank);
    }
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o && intern) setForm({ ...blank, ...intern });
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="size-4" /> Add / manage intern
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{intern ? `Update ${intern.code}` : "Add intern"}</DialogTitle>
          <DialogDescription>
            Name, department and designation. The assignment ID (Intern 1, Intern 2, …) and login password are set here too.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Row label="Name">
            <Input maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Row>
          <Row label="Department">
            <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </Row>
          <Row label="Designation">
            <Select value={form.designation} onValueChange={(v) => setForm({ ...form, designation: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DESIGNATIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </Row>
          <Row label="Email">
            <Input type="email" maxLength={120} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Row>
          <Row label="Phone">
            <Input maxLength={20} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Row>
          <Row label="Start date">
            <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </Row>
          <Row label="Total working hours">
            <Input type="number" min={0} value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: Number(e.target.value) })} />
          </Row>
          <Row label="Login password">
            <Input maxLength={40} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="intern password" />
          </Row>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>{intern ? "Save changes" : "Add intern"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
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
    <Field label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {includeAll && <SelectItem value={ALL}>All</SelectItem>}
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </Field>
  );
}
