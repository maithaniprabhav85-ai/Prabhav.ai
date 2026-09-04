import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { seedData } from "./seed";
import type { Activity, CrmData, Intern, Lead, Settings } from "./types";

const KEY = "intern-lead-crm-v1";

function load(): CrmData {
  if (typeof window === "undefined") return seedData;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seedData;
    const parsed = JSON.parse(raw) as CrmData;
    return { ...seedData, ...parsed, settings: { ...seedData.settings, ...parsed.settings } };
  } catch {
    return seedData;
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);

export interface InternStats {
  intern: Intern;
  assigned: number;
  completedFollowUps: number;
  followUpRate: number;
  converted: number;
  hours: number;
}

export interface CrmNotification {
  id: string;
  kind: "overdue" | "upcoming" | "update";
  title: string;
  body: string;
  at: string;
}

interface Ctx {
  data: CrmData;
  hydrated: boolean;
  interns: Intern[];
  leads: Lead[];
  activities: Activity[];
  followUps: FollowUpLog[];
  settings: Settings;
  addLead: (l: Omit<Lead, "id" | "createdAt">) => void;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  addIntern: (i: Omit<Intern, "id">) => void;
  completeFollowUp: (leadId: string) => void;
  rescheduleFollowUp: (leadId: string, date: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetDemoData: () => void;
  internStats: (id: string) => InternStats | undefined;
  allStats: InternStats[];
  notifications: CrmNotification[];
  unreadCount: number;
  markAllRead: () => void;
}

const CrmContext = createContext<Ctx | null>(null);

export function CrmProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CrmData>(seedData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(KEY, JSON.stringify(data));
  }, [data, hydrated]);

  const value = useMemo<Ctx>(() => {
    const logActivity = (d: CrmData, a: Omit<Activity, "id" | "createdAt">): CrmData => ({
      ...d,
      activities: [{ ...a, id: uid(), createdAt: new Date().toISOString() }, ...d.activities].slice(0, 200),
    });

    const internName = (id: string) => data.interns.find((i) => i.id === id)?.name ?? "Unassigned";

    const statsFor = (intern: Intern): InternStats => {
      const assignedLeads = data.leads.filter((l) => l.internId === intern.id);
      const completed = data.followUps.filter((f) => f.internId === intern.id).length;
      const target = assignedLeads.length * 2 || 1;
      return {
        intern,
        assigned: assignedLeads.length,
        completedFollowUps: completed,
        followUpRate: Math.min(100, Math.round((completed / target) * 100)),
        converted: assignedLeads.filter((l) => l.status === "Converted").length,
        hours: intern.workingHours,
      };
    };

    const allStats = data.interns.map(statsFor);

    const notifications: CrmNotification[] = [];
    const t = today();
    for (const l of data.leads) {
      if (!l.nextFollowUp) continue;
      if (l.nextFollowUp < t && data.settings.notifyOverdue) {
        notifications.push({
          id: `n-over-${l.id}-${l.nextFollowUp}`,
          kind: "overdue",
          title: `Overdue follow-up: ${l.company}`,
          body: `${internName(l.internId)} was due on ${l.nextFollowUp}`,
          at: l.nextFollowUp,
        });
      } else if (l.nextFollowUp >= t && l.nextFollowUp <= new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10) && data.settings.notifyUpcoming) {
        notifications.push({
          id: `n-up-${l.id}-${l.nextFollowUp}`,
          kind: "upcoming",
          title: `${l.nextFollowUp === t ? "Today" : "Upcoming"}: ${l.company}`,
          body: `${internName(l.internId)} · ${l.priority} priority · ${l.status}`,
          at: l.nextFollowUp,
        });
      }
    }
    for (const a of data.activities.slice(0, 5)) {
      if (a.type === "lead_updated" || a.type === "followup_completed") {
        notifications.push({ id: `n-act-${a.id}`, kind: "update", title: a.message, body: new Date(a.createdAt).toLocaleString(), at: a.createdAt });
      }
    }
    notifications.sort((a, b) => b.at.localeCompare(a.at));

    return {
      data,
      hydrated,
      interns: data.interns,
      leads: data.leads,
      activities: data.activities,
      settings: data.settings,
      allStats,
      notifications,
      unreadCount: notifications.filter((n) => !data.readNotificationIds.includes(n.id)).length,
      markAllRead: () => setData((d) => ({ ...d, readNotificationIds: notifications.map((n) => n.id) })),
      internStats: (id) => allStats.find((s) => s.intern.id === id),
      addLead: (l) =>
        setData((d) => {
          const lead: Lead = { ...l, id: uid(), createdAt: new Date().toISOString() };
          return logActivity({ ...d, leads: [lead, ...d.leads] }, {
            leadId: lead.id,
            internId: lead.internId,
            type: "lead_created",
            message: `${internName(lead.internId)} added lead ${lead.company}`,
          });
        }),
      updateLead: (id, patch) =>
        setData((d) => {
          const leads = d.leads.map((l) => (l.id === id ? { ...l, ...patch } : l));
          const lead = leads.find((l) => l.id === id)!;
          return logActivity({ ...d, leads }, {
            leadId: id,
            internId: lead.internId,
            type: "lead_updated",
            message: `${lead.company} updated — status ${lead.status}, ${lead.priority} priority`,
          });
        }),
      deleteLead: (id) =>
        setData((d) => {
          const lead = d.leads.find((l) => l.id === id);
          return logActivity({ ...d, leads: d.leads.filter((l) => l.id !== id) }, {
            type: "lead_deleted",
            message: `Lead ${lead?.company ?? ""} was deleted`,
          });
        }),
      addIntern: (i) =>
        setData((d) => {
          const intern: Intern = { ...i, id: uid() };
          return logActivity({ ...d, interns: [...d.interns, intern] }, {
            internId: intern.id,
            type: "intern_added",
            message: `${intern.name} joined the team`,
          });
        }),
      completeFollowUp: (leadId) =>
        setData((d) => {
          const lead = d.leads.find((l) => l.id === leadId);
          if (!lead) return d;
          const next = new Date(Date.now() + d.settings.defaultFollowUpDays * 86400000).toISOString().slice(0, 10);
          const leads = d.leads.map((l) =>
            l.id === leadId ? { ...l, nextFollowUp: next, status: l.status === "New" ? ("Contacted" as const) : l.status } : l,
          );
          return logActivity(
            {
              ...d,
              leads,
              followUps: [{ id: uid(), leadId, internId: lead.internId, completedAt: new Date().toISOString() }, ...d.followUps],
            },
            {
              leadId,
              internId: lead.internId,
              type: "followup_completed",
              message: `${internName(lead.internId)} completed a follow-up with ${lead.company}`,
            },
          );
        }),
      rescheduleFollowUp: (leadId, date) =>
        setData((d) => {
          const lead = d.leads.find((l) => l.id === leadId);
          if (!lead) return d;
          return logActivity({ ...d, leads: d.leads.map((l) => (l.id === leadId ? { ...l, nextFollowUp: date } : l)) }, {
            leadId,
            internId: lead.internId,
            type: "followup_rescheduled",
            message: `${lead.company} follow-up moved to ${date}`,
          });
        }),
      updateSettings: (patch) => setData((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
      resetDemoData: () => setData(seedData),
    };
  }, [data, hydrated]);

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error("useCrm must be used inside CrmProvider");
  return ctx;
}
