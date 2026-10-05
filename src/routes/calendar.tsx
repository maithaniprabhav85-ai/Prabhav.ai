import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/crm/AppLayout";
import { Calendar } from "@/components/ui/calendar";
import { useCrm } from "@/lib/crm/context";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/crm/bits";
import { format } from "date-fns";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  const { leads } = useCrm();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const selectedDateStr = date ? format(date, "yyyy-MM-dd") : "";
  const dayLeads = leads.filter(l => l.nextFollowUp === selectedDateStr);

  const bookedDates = leads
    .filter(l => l.nextFollowUp)
    .map(l => new Date(l.nextFollowUp));

  return (
    <>
      <PageHeader title="Follow-up Calendar" subtitle="Visual schedule of upcoming touchpoints" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow"
              modifiers={{ booked: bookedDates }}
              modifiersClassNames={{ booked: "bg-primary/20 font-bold text-primary" }}
            />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {date ? format(date, "MMMM d, yyyy") : "Select a date"}
          </h3>
          {dayLeads.length === 0 ? (
            <p className="text-muted-foreground italic">No follow-ups scheduled for this day.</p>
          ) : (
            dayLeads.map(l => (
              <Card key={l.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-navy">{l.company}</p>
                    <p className="text-sm text-muted-foreground">{l.contactPerson}</p>
                  </div>
                  <StatusPill status={l.status} />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
