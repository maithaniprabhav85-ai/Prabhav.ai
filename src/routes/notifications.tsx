import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Bell, CalendarClock, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/crm/AppLayout";
import { EmptyState } from "@/components/crm/bits";
import { Button } from "@/components/ui/button";
import { useCrm } from "@/lib/crm/context";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — InternLead CRM" },
      { name: "description", content: "Overdue and upcoming follow-up alerts plus recent pipeline updates for your intern team." },
      { property: "og:title", content: "Notifications — InternLead CRM" },
      { property: "og:description", content: "Never miss an overdue follow-up or a lead status change." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Notifications,
});

const ICONS = { overdue: AlertTriangle, upcoming: CalendarClock, update: Bell } as const;

function Notifications() {
  const { notifications, unreadCount, markAllRead, data } = useCrm();

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread of ${notifications.length}`}
        action={
          <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="size-4" /> Mark all read
          </Button>
        }
      />

      {notifications.length === 0 ? (
        <EmptyState title="Nothing to report" body="Follow-up alerts appear here as dates approach." />
      ) : (
        <ul className="surface-card divide-y">
          {notifications.map((n) => {
            const Icon = ICONS[n.kind];
            const unread = !data.readNotificationIds.includes(n.id);
            return (
              <li key={n.id} className="flex gap-4 px-5 py-4">
                <span
                  className={
                    n.kind === "overdue"
                      ? "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive"
                      : "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
                  }
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.body}</p>
                </div>
                {unread && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
