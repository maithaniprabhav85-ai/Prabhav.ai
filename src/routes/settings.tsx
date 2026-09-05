import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/crm/AppLayout";
import { ChangePasswordDialog } from "@/components/crm/ChangePasswordDialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCrm } from "@/lib/crm/context";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — InternLead CRM" },
      { name: "description", content: "Set your role, company name, default follow-up interval, table density and notification preferences." },
      { property: "og:title", content: "Settings — InternLead CRM" },
      { property: "og:description", content: "Tune roles, follow-up defaults and alerts for your CRM." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, updateSettings, resetDemoData } = useCrm();

  return (
    <>
      <PageHeader title="Settings" subtitle="Preferences are stored on this device" />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-card p-5">
          <h2 className="text-sm font-semibold text-navy">Workspace</h2>
          <div className="mt-4 grid gap-4">
            <Field label="Company name">
              <Input value={settings.companyName} onChange={(e) => updateSettings({ companyName: e.target.value })} />
            </Field>
            <Field label="Your role">
              <Select value={settings.role} onValueChange={(v) => updateSettings({ role: v as "Founder" | "Intern" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Founder">Founder</SelectItem>
                  <SelectItem value="Intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Default follow-up interval (days)">
              <Input
                type="number"
                min={1}
                value={settings.defaultFollowUpDays}
                onChange={(e) => updateSettings({ defaultFollowUpDays: Math.max(1, Number(e.target.value)) })}
              />
            </Field>
          </div>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-sm font-semibold text-navy">Notifications & display</h2>
          <div className="mt-4 divide-y">
            <Toggle
              label="Overdue follow-up alerts"
              hint="Warn when a follow-up date has passed"
              checked={settings.notifyOverdue}
              onChange={(v) => updateSettings({ notifyOverdue: v })}
            />
            <Toggle
              label="Upcoming follow-up alerts"
              hint="Remind about the next 3 days"
              checked={settings.notifyUpcoming}
              onChange={(v) => updateSettings({ notifyUpcoming: v })}
            />
            <Toggle
              label="Compact lead table"
              hint="Tighter rows in the leads view"
              checked={settings.compactTable}
              onChange={(v) => updateSettings({ compactTable: v })}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <ChangePasswordDialog />
            <Button
              variant="outline"
              onClick={() => {
                resetDemoData();
                toast.success("Demo data restored");
              }}
            >
              <RotateCcw className="size-4" /> Reset demo data
            </Button>
          </div>

        </section>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
