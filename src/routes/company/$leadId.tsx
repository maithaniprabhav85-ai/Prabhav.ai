import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/crm/AppLayout";
import { EmptyState, PriorityPill, StatusPill } from "@/components/crm/bits";
import { Button } from "@/components/ui/button";
import { useCrm } from "@/lib/crm/context";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/company/$leadId")({
  head: () => ({
    meta: [
      { title: "Company details — LeadPilot CRM" },
      { name: "description", content: "Full company profile with contact details, lead status, assigned intern and complete reach-out history." },
      { property: "og:title", content: "Company details — LeadPilot CRM" },
      { property: "og:description", content: "Everything recorded about one company and who reached out." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CompanyDetails,
});

function CompanyDetails() {
  const { leadId } = Route.useParams();
  const { allLeads, interns, activities, followUps } = useCrm();
  const lead = allLeads.find((l) => l.id === leadId);

  if (!lead) {
    return (
      <>
        <PageHeader title="Company not found" />
        <EmptyState title="This company is not in your list" body="Pick a company from the leads table." />
        <Button asChild className="mt-4"><Link to="/leads">Back to leads</Link></Button>
      </>
    );
  }

  const internName = (id: string) => interns.find((i) => i.id === id)?.code ?? "Unassigned";
  const owner = interns.find((i) => i.id === lead.internId);
  const history = activities.filter((a) => a.leadId === lead.id);
  const reachOuts = followUps.filter((f) => f.leadId === lead.id);

  const fields: [string, string][] = [
    ["Company name", lead.company],
    ["Contact person", lead.contactPerson],
    ["Email", lead.email || "—"],
    ["Phone", lead.phone || "—"],
    ["Industry", lead.industry],
    ["Location", lead.location],
    ["Assigned intern", owner ? `${owner.code} · ${owner.name}` : "Unassigned"],
    ["Created", formatDateTime(lead.createdAt)],
    ["Next follow-up", lead.nextFollowUp || "—"],
  ];

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
        <Link to="/leads"><ArrowLeft className="size-4" /> Back to leads</Link>
      </Button>
      <PageHeader
        title={lead.company}
        subtitle={`${lead.industry} · ${lead.location}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={lead.status} />
            <PriorityPill priority={lead.priority} />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="surface-card overflow-hidden lg:col-span-3">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-navy">Company details</h2>
          </div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 px-5 py-5 sm:grid-cols-2">
            {fields.map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 break-words text-sm font-medium text-navy">{v}</dd>
              </div>
            ))}
            <div className="min-w-0 sm:col-span-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Notes</dt>
              <dd className="mt-0.5 text-sm text-foreground">{lead.notes || "No notes recorded."}</dd>
            </div>
          </dl>
        </section>

        <section className="surface-card overflow-hidden lg:col-span-2">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-navy">Reach-out history</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {reachOuts.length} completed follow-up{reachOuts.length === 1 ? "" : "s"}
            </p>
          </div>
          {reachOuts.length === 0 && history.length === 0 ? (
            <EmptyState title="No contact recorded yet" />
          ) : (
            <ul className="divide-y">
              {reachOuts.map((f) => (
                <li key={f.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-navy">{internName(f.internId)} contacted {lead.company}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(f.completedAt)}</p>
                </li>
              ))}
              {history.map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <p className="text-sm">{a.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDateTime(a.createdAt)} · {a.type.replace(/_/g, " ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
