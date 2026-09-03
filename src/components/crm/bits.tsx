import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Progress } from "@/components/ui/progress";
import type { LeadPriority, LeadStatus } from "@/lib/crm/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<LeadStatus, string> = {
  New: "bg-muted text-muted-foreground",
  Contacted: "bg-info/10 text-info",
  "Follow-up": "bg-warning/15 text-warning",
  Qualified: "bg-primary/10 text-primary",
  Converted: "bg-success/12 text-success",
  Lost: "bg-destructive/10 text-destructive",
};

const priorityStyles: Record<LeadPriority, string> = {
  Hot: "bg-destructive/10 text-destructive",
  Warm: "bg-warning/15 text-warning",
  Cold: "bg-info/10 text-info",
};

export function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", statusStyles[status])}>
      {status}
    </span>
  );
}

export function PriorityPill({ priority }: { priority: LeadPriority }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", priorityStyles[priority])}>
      {priority}
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  progress,
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  hint?: string;
  progress?: number;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        {Icon && (
          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold text-navy">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {progress !== undefined && <Progress value={progress} className="mt-3 h-1.5" />}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="surface-card grid place-items-center px-6 py-12 text-center">
      <p className="text-sm font-semibold text-navy">{title}</p>
      {body && <p className="mt-1 text-sm text-muted-foreground">{body}</p>}
    </div>
  );
}
