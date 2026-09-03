import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/crm/AppLayout";
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
import { useCrm } from "@/lib/crm/store";

export const Route = createFileRoute("/interns/")({
  head: () => ({
    meta: [
      { title: "Intern Profiles — InternLead CRM" },
      { name: "description", content: "Browse every intern with start date, working hours, assigned leads and follow-up performance." },
      { property: "og:title", content: "Intern Profiles — InternLead CRM" },
      { property: "og:description", content: "Open any intern profile to review their leads and performance." },
    ],
  }),
  component: Interns,
});

function Interns() {
  const { allStats } = useCrm();

  return (
    <>
      <PageHeader title="Intern profiles" subtitle={`${allStats.length} interns on the team`} action={<AddIntern />} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {allStats.map((s) => (
          <Link
            key={s.intern.id}
            to="/interns/$internId"
            params={{ internId: s.intern.id }}
            className="surface-card block p-5 transition-shadow hover:shadow-elevated"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-navy text-sm font-bold text-navy-foreground">
                {s.intern.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-navy">{s.intern.name}</p>
                <p className="truncate text-xs text-muted-foreground">{s.intern.email}</p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Mini label="Leads" value={s.assigned} />
              <Mini label="Converted" value={s.converted} />
              <Mini label="Hours" value={s.hours} />
            </dl>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Follow-up rate</span>
                <span className="font-semibold text-primary">{s.followUpRate}%</span>
              </div>
              <Progress value={s.followUpRate} className="mt-1.5 h-1.5" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Started {s.intern.startDate}</p>
          </Link>
        ))}
      </div>
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

function AddIntern() {
  const { addIntern, interns } = useCrm();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    startDate: new Date().toISOString().slice(0, 10),
    workingHours: 0,
  });

  const submit = () => {
    const name = form.name.trim() || `Intern ${interns.length + 1}`;
    addIntern({ ...form, name });
    toast.success(`${name} added`);
    setOpen(false);
    setForm({ name: "", email: "", phone: "", startDate: new Date().toISOString().slice(0, 10), workingHours: 0 });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="size-4" /> Add intern</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add intern</DialogTitle>
          <DialogDescription>Interns can be added without limit; leave the name blank to auto-number.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Row label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={`Intern ${interns.length + 1}`} />
          </Row>
          <Row label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Row>
          <Row label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Row>
          <Row label="Start date">
            <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </Row>
          <Row label="Total working hours">
            <Input
              type="number"
              min={0}
              value={form.workingHours}
              onChange={(e) => setForm({ ...form, workingHours: Number(e.target.value) })}
            />
          </Row>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Add intern</Button>
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
