import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCrm } from "@/lib/crm/store";
import { INDUSTRIES, LEAD_PRIORITIES, LEAD_STATUSES, type Lead } from "@/lib/crm/types";

type Draft = Omit<Lead, "id" | "createdAt">;

const empty = (internId: string, days: number): Draft => ({
  company: "",
  contactPerson: "",
  email: "",
  phone: "",
  industry: INDUSTRIES[0]!,
  location: "",
  status: "New",
  priority: "Warm",
  internId,
  nextFollowUp: new Date(Date.now() + days * 86400000).toISOString().slice(0, 10),
  notes: "",
});

export function LeadDialog({ lead, trigger }: { lead?: Lead; trigger: ReactNode }) {
  const { interns, addLead, updateLead, settings } = useCrm();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => lead ?? empty(interns[0]?.id ?? "", settings.defaultFollowUpDays));

  useEffect(() => {
    if (open) setDraft(lead ?? empty(interns[0]?.id ?? "", settings.defaultFollowUpDays));
  }, [open, lead, interns, settings.defaultFollowUpDays]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const submit = () => {
    if (!draft.company.trim() || !draft.contactPerson.trim()) {
      toast.error("Company and contact person are required");
      return;
    }
    if (lead) {
      updateLead(lead.id, draft);
      toast.success("Lead updated");
    } else {
      addLead(draft);
      toast.success("Lead added");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit lead" : "Add lead"}</DialogTitle>
          <DialogDescription>Track company details, ownership and the next follow-up.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company">
            <Input value={draft.company} onChange={(e) => set("company", e.target.value)} placeholder="Acme Inc." />
          </Field>
          <Field label="Contact person">
            <Input value={draft.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} placeholder="Jane Doe" />
          </Field>
          <Field label="Email">
            <Input type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={draft.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Industry">
            <Select value={draft.industry} onValueChange={(v) => set("industry", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Location">
            <Input value={draft.location} onChange={(e) => set("location", e.target.value)} />
          </Field>
          <Field label="Status">
            <Select value={draft.status} onValueChange={(v) => set("status", v as Draft["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={draft.priority} onValueChange={(v) => set("priority", v as Draft["priority"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEAD_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Assigned intern ID">
            <Select value={draft.internId} onValueChange={(v) => set("internId", v)}>
              <SelectTrigger><SelectValue placeholder="Select intern" /></SelectTrigger>
              <SelectContent>
                {interns.map((i) => <SelectItem key={i.id} value={i.id}>{i.code}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Next follow-up">
            <Input type="date" value={draft.nextFollowUp} onChange={(e) => set("nextFollowUp", e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <Textarea rows={3} value={draft.notes} onChange={(e) => set("notes", e.target.value)} />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>{lead ? "Save changes" : "Add lead"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
