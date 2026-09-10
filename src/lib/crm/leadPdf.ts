import { formatDateTime } from "@/lib/format";
import type { Lead } from "@/lib/crm/types";

const esc = (v: string) =>
  String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

/** Opens the browser print dialog with a clean single-lead sheet (Save as PDF). */
export function downloadLeadPdf(lead: Lead, internLabel: string) {
  const rows: [string, string][] = [
    ["Company", lead.company],
    ["Contact person", lead.contactPerson],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Industry", lead.industry],
    ["Location", lead.location],
    ["Status", lead.status],
    ["Priority", lead.priority],
    ["Assigned intern", internLabel],
    ["Next follow-up", lead.nextFollowUp || "—"],
    ["Notes", lead.notes || "—"],
    ["Created date", formatDateTime(lead.createdAt)],
  ];

  const html = `<!doctype html><html><head><meta charset="utf-8" />
<title>${esc(lead.company)} — Lead details</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;padding:32px;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#172033}
  h1{margin:0;font-size:22px;color:#0B1F33}
  .sub{margin:4px 0 24px;font-size:12px;color:#64748B}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{width:38%;text-align:left;padding:10px 12px;background:#EAF2FF;color:#0B1F33;border:1px solid #dbe6f7;vertical-align:top}
  td{padding:10px 12px;border:1px solid #dbe6f7;vertical-align:top}
  @media print{body{padding:0}}
</style></head><body>
<h1>${esc(lead.company)}</h1>
<p class="sub">Lead details — LeadPilot CRM</p>
<table>${rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table>
<script>window.onload=function(){window.print()}<\/script>
</body></html>`;

  const win = window.open("", "_blank", "width=820,height=900");
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  return true;
}

/** Downloads the given leads (already filtered) as a CSV file. */
export function downloadLeadsCsv(leads: Lead[], internLabel: (id: string) => string) {
  const headers = [
    "Company", "Contact person", "Email", "Phone", "Industry", "Location",
    "Status", "Priority", "Assigned intern", "Next follow-up", "Notes", "Created",
  ];
  const cell = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = leads.map((l) =>
    [
      l.company, l.contactPerson, l.email, l.phone, l.industry, l.location,
      l.status, l.priority, internLabel(l.internId), l.nextFollowUp || "—", l.notes || "—",
      formatDateTime(l.createdAt),
    ].map(cell).join(","),
  );
  const csv = [headers.map(cell).join(","), ...rows].join("\r\n");
  const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `leadpilot-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
