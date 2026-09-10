import { formatDateTime } from "@/lib/format";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/crm/AppLayout";
import { EmptyState } from "@/components/crm/bits";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCrm } from "@/lib/crm/context";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "Activities — LeadPilot CRM" },
      { name: "description", content: "Chronological timeline of lead creations, updates, completed follow-ups and team changes." },
      { property: "og:title", content: "Activities — LeadPilot CRM" },
      { property: "og:description", content: "A single timeline of everything happening across the pipeline." },
    ],
  }),
  component: Activities,
});

function Activities() {
  const { activities, interns } = useCrm();
  const [intern, setIntern] = useState("all");

  const list = activities.filter((a) => intern === "all" || a.internId === intern);

  return (
    <>
      <PageHeader
        title="Activities"
        subtitle="Everything the team has touched recently"
        action={
          <Select value={intern} onValueChange={setIntern}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All interns</SelectItem>
              {interns.map((i) => <SelectItem key={i.id} value={i.id}>{i.code}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      {list.length === 0 ? (
        <EmptyState title="No activity recorded" body="Add or update a lead to see it here." />
      ) : (
        <ol className="surface-card divide-y">
          {list.map((a) => (
            <li key={a.id} className="flex gap-4 px-5 py-4">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0">
                <p className="text-sm text-foreground">{a.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDateTime(a.createdAt)} · {a.type.replace(/_/g, " ")}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
