import { Download, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCrm } from "@/lib/crm/context";
import { INDUSTRIES, LEAD_PRIORITIES, LEAD_STATUSES, type Lead } from "@/lib/crm/types";

type LeadField = "company" | "contactPerson" | "email" | "phone" | "industry" | "location" | "status" | "priority" | "internId" | "nextFollowUp" | "notes";
const fields: Array<{ value: LeadField | "skip"; label: string }> = [
  { value: "skip", label: "Do not import" },
  { value: "company", label: "Company" }, { value: "contactPerson", label: "Contact person" },
  { value: "email", label: "Email" }, { value: "phone", label: "Phone" },
  { value: "industry", label: "Industry" }, { value: "location", label: "Location" },
  { value: "status", label: "Status" }, { value: "priority", label: "Priority" },
  { value: "internId", label: "Assigned intern ID" }, { value: "nextFollowUp", label: "Next follow-up" },
  { value: "notes", label: "Notes" },
];

const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
const parseCsv = (text: string) => text.trim().split(/\r?\n/).map((line) => {
  const cells: string[] = []; let cell = ""; let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { cells.push(cell.trim()); cell = ""; }
    else cell += char;
  }
  cells.push(cell.trim()); return cells;
});

export function exportLeadsCsv(leads: Lead[]) {
  const headers = ["Company", "Contact", "Email", "Phone", "Industry", "Location", "Status", "Priority", "Assigned Intern", "Next Follow-up", "Notes", "Created"];
  const rows = leads.map((lead) => [lead.company, lead.contactPerson, lead.email, lead.phone, lead.industry, lead.location, lead.status, lead.priority, lead.internId, lead.nextFollowUp, lead.notes, lead.createdAt]);
  const blob = new Blob([[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
  anchor.href = url; anchor.download = "leadpilot-leads.csv"; anchor.click(); URL.revokeObjectURL(url);
}

export function LeadCsvTools({ leads }: { leads: Lead[] }) {
  return <div className="flex gap-2"><ImportLeads /><Button variant="outline" onClick={() => exportLeadsCsv(leads)}><Download className="size-4" /> Export CSV</Button></div>;
}

function ImportLeads() {
  const { addLead, interns } = useCrm();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<number, LeadField | "skip">>({});
  const preview = useMemo(() => rows.slice(0, 4), [rows]);

  const load = async (file?: File) => {
    if (!file) return;
    const parsed = parseCsv(await file.text()); const nextHeaders = parsed[0] ?? [];
    setHeaders(nextHeaders); setRows(parsed.slice(1).filter((row) => row.some(Boolean)));
    setMapping(Object.fromEntries(nextHeaders.map((header, index) => {
      const normalized = header.toLowerCase().replace(/[^a-z]/g, "");
      const found = fields.find((field) => field.value !== "skip" && field.label.toLowerCase().replace(/[^a-z]/g, "") === normalized);
      return [index, found?.value ?? "skip"];
    })));
    setOpen(true);
  };

  const submit = (importDuplicates: boolean) => {
    let imported = 0; let skipped = 0;
    for (const row of rows) {
      const values = Object.fromEntries(Object.entries(mapping).filter(([, field]) => field !== "skip").map(([index, field]) => [field, row[Number(index)] ?? ""])) as Partial<Record<LeadField, string>>;
      if (!values.company?.trim() || !values.contactPerson?.trim()) { skipped += 1; continue; }
      const intern = interns.find((item) => item.id === values.internId || item.code === values.internId) ?? interns[0];
      const status = LEAD_STATUSES.includes(values.status as Lead["status"]) ? values.status as Lead["status"] : "New";
      const priority = LEAD_PRIORITIES.includes(values.priority as Lead["priority"]) ? values.priority as Lead["priority"] : "Warm";
      const industry = INDUSTRIES.includes(values.industry ?? "") ? values.industry ?? INDUSTRIES[0] : INDUSTRIES[0];
      const result = addLead({ company: values.company, contactPerson: values.contactPerson, email: values.email ?? "", phone: values.phone ?? "", industry: industry ?? "SaaS", location: values.location ?? "", status, priority, internId: intern?.id ?? "", nextFollowUp: values.nextFollowUp ?? "", notes: values.notes ?? "" }, importDuplicates);
      if (result.ok) imported += 1; else skipped += 1;
    }
    toast.success(`${imported} lead${imported === 1 ? "" : "s"} imported${skipped ? ` · ${skipped} skipped` : ""}`); setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <input ref={input} className="sr-only" type="file" accept=".csv,text/csv" onChange={(event) => load(event.target.files?.[0])} />
      <DialogTrigger asChild><Button variant="outline" onClick={() => input.current?.click()}><Upload className="size-4" /> Import CSV</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>Import leads from CSV</DialogTitle><DialogDescription>Map columns, preview the records, then choose how duplicate leads are handled.</DialogDescription></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{headers.map((header, index) => <label key={`${header}-${index}`} className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{header}<Select value={mapping[index] ?? "skip"} onValueChange={(value) => setMapping((current) => ({ ...current, [index]: value as LeadField | "skip" }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{fields.map((field) => <SelectItem key={field.value} value={field.value}>{field.label}</SelectItem>)}</SelectContent></Select></label>)}</div>
        <div className="overflow-x-auto rounded-xl border"><table className="w-full min-w-[560px] text-xs"><thead className="bg-muted/60"><tr>{headers.map((header, index) => <th key={`${header}-${index}`} className="px-3 py-2 text-left font-semibold">{header}</th>)}</tr></thead><tbody className="divide-y">{preview.map((row, rowIndex) => <tr key={rowIndex}>{headers.map((_, index) => <td key={index} className="max-w-40 truncate px-3 py-2">{row[index]}</td>)}</tr>)}</tbody></table></div>
        <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button variant="secondary" onClick={() => submit(false)}>Skip duplicates</Button><Button onClick={() => submit(true)}>Import anyway</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}