import { formatDateTime } from "@/lib/format";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { seedData } from "./seed";
import type { Activity, CrmData, Intern, Lead, Session } from "./types";
import { CrmContext, type Ctx, type CrmNotification, type InternStats } from "./context";

export type { InternStats, CrmNotification } from "./context";

const KEY = "intern-lead-crm-v1";

function load(): CrmData {
  if (typeof window === "undefined") return seedData;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seedData;
    const parsed = JSON.parse(raw) as Partial<CrmData>;
    return {
      ...seedData,
      ...parsed,
      interns: (parsed.interns ?? seedData.interns).map((i, idx) => ({
        ...i,
        code: i.code || `Intern ${idx + 1}`,
        department: i.department || "Sales",
        designation: i.designation || "Sales Intern",
        password: i.password || `intern${idx + 1}`,
      })),
      leads: parsed.leads ?? seedData.leads,
      activities: parsed.activities ?? seedData.activities,
      followUps: parsed.followUps ?? seedData.followUps,
      readNotificationIds: parsed.readNotificationIds ?? [],
      session: parsed.session ?? null,
      settings: { ...seedData.settings, ...parsed.settings },
    };
  } catch {
    return seedData;
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);

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

    const internName = (id: string) => data.interns.find((i) => i.id === id)?.code ?? "Unassigned";

    const session = data.session;
    const isFounder = session?.role === "Founder";
    const currentIntern = session?.role === "Intern" ? data.interns.find((i) => i.id === session.internId) ?? null : null;
    const mine = <T extends { internId?: string }>(rows: T[]) =>
      isFounder || !currentIntern ? rows : rows.filter((r) => r.internId === currentIntern.id);

    const visibleInterns = isFounder || !currentIntern ? data.interns : [currentIntern];
    const visibleLeads = mine(data.leads);
    const visibleActivities = mine(data.activities);
    const visibleFollowUps = mine(data.followUps);

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

    const allStats = visibleInterns.map(statsFor);

    const notifications: CrmNotification[] = [];
    const t = today();
    for (const l of visibleLeads) {
      if (!l.nextFollowUp) continue;
      if (l.nextFollowUp < t && data.settings.notifyOverdue) {
        notifications.push({
          id: `n-over-${l.id}-${l.nextFollowUp}`,
          kind: "overdue",
          title: `Overdue follow-up: ${l.company}`,
          body: `${internName(l.internId)} was due on ${l.nextFollowUp}`,
          at: l.nextFollowUp,
        });
      } else if (
        l.nextFollowUp >= t &&
        l.nextFollowUp <= new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10) &&
        data.settings.notifyUpcoming
      ) {
        notifications.push({
          id: `n-up-${l.id}-${l.nextFollowUp}`,
          kind: "upcoming",
          title: `${l.nextFollowUp === t ? "Today" : "Upcoming"}: ${l.company}`,
          body: `${internName(l.internId)} · ${l.priority} priority · ${l.status}`,
          at: l.nextFollowUp,
        });
      }
    }
    for (const a of visibleActivities.slice(0, 5)) {
      if (a.type === "lead_updated" || a.type === "followup_completed") {
        notifications.push({ id: `n-act-${a.id}`, kind: "update", title: a.message, body: formatDateTime(a.createdAt), at: a.createdAt });
      }
    }
    notifications.sort((a, b) => b.at.localeCompare(a.at));

    return {
      data,
      hydrated,
      interns: visibleInterns,
      leads: visibleLeads,
      activities: visibleActivities,
      followUps: visibleFollowUps,
      settings: data.settings,
      session,
      isFounder,
      currentIntern,
      signIn: (userId, password) => {
        const id = userId.trim();
        const pass = password.trim();
        if (
          id.toLowerCase() === data.settings.adminId.toLowerCase() &&
          pass === data.settings.adminPassword
        ) {
          setData((d) => ({ ...d, session: { role: "Founder", internId: null }, settings: { ...d.settings, role: "Founder" } }));
          return true;
        }
        const intern = data.interns.find(
          (i) => i.code.toLowerCase() === id.toLowerCase() || i.email.toLowerCase() === id.toLowerCase(),
        );
        if (intern && intern.password === pass) {
          const s: Session = { role: "Intern", internId: intern.id };
          setData((d) => ({ ...d, session: s, settings: { ...d.settings, role: "Intern" } }));
          return true;
        }
        return false;
      },
      signOut: () => setData((d) => ({ ...d, session: null })),
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
          const nextNum =
            d.interns.reduce((max, x) => Math.max(max, Number(x.code.replace(/[^0-9]/g, "")) || 0), 0) + 1;
          const intern: Intern = { ...i, id: uid(), code: `Intern ${nextNum}` };
          return logActivity({ ...d, interns: [...d.interns, intern] }, {
            internId: intern.id,
            type: "intern_added",
            message: `${intern.code} (${intern.name}) joined ${intern.department}`,
          });
        }),
      updateIntern: (id, patch) =>
        setData((d) => {
          const interns = d.interns.map((i) => (i.id === id ? { ...i, ...patch } : i));
          const intern = interns.find((i) => i.id === id)!;
          return logActivity({ ...d, interns }, {
            internId: id,
            type: "intern_updated",
            message: `${intern.code} profile updated — ${intern.designation}, ${intern.department}`,
          });
        }),
      deleteIntern: (id) =>
        setData((d) => {
          const intern = d.interns.find((i) => i.id === id);
          return logActivity(
            {
              ...d,
              interns: d.interns.filter((i) => i.id !== id),
              leads: d.leads.map((l) => (l.internId === id ? { ...l, internId: "" } : l)),
            },
            { type: "intern_deleted", message: `${intern?.code ?? "Intern"} (${intern?.name ?? ""}) was removed` },
          );
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
      resetDemoData: () => setData({ ...seedData, session: data.session }),
    };
  }, [data, hydrated]);

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}
