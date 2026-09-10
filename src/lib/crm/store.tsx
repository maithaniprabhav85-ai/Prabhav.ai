import { formatDateTime } from "@/lib/format";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { seedData } from "./seed";
import type { Activity, CrmData, Intern, Lead, Session, WorkSession } from "./types";
import { CrmContext, type Ctx, type CrmNotification, type InternInsights, type InternStats } from "./context";

export type { InternStats, CrmNotification } from "./context";

const KEY = "intern-lead-crm-v1";

function load(): CrmData {
  if (typeof window === "undefined") return seedData;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seedData;
    const parsed = JSON.parse(raw) as Partial<CrmData>;
    const savedSettings = { ...seedData.settings, ...parsed.settings };
    if (savedSettings.companyName === "InternLead CRM") savedSettings.companyName = "LeadPilot CRM";
    if (!savedSettings.adminEmail) savedSettings.adminEmail = seedData.settings.adminEmail;
    return {
      ...seedData,
      ...parsed,
      interns: (parsed.interns ?? seedData.interns).map((i, idx) => ({
        ...i,
        code: toInternCode(i.code, idx + 1),
        department: i.department || "Sales",
        designation: i.designation || "Sales Intern",
        password: i.password || `intern${idx + 1}`,
        online: i.online ?? false,
      })),
      leads: parsed.leads ?? seedData.leads,
      activities: parsed.activities ?? seedData.activities,
      followUps: parsed.followUps ?? seedData.followUps,
      workSessions: parsed.workSessions ?? [],
      readNotificationIds: parsed.readNotificationIds ?? [],
      session: parsed.session ?? null,
      settings: savedSettings,
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
    const allVisibleLeads = mine(data.leads);
    const visibleLeads = allVisibleLeads.filter((l) => !l.archived);
    const visibleActivities = mine(data.activities);
    const visibleFollowUps = mine(data.followUps);

    const sessionsOf = (internId: string) => data.workSessions.filter((w) => w.internId === internId);
    const hoursOf = (rows: WorkSession[]) =>
      rows.reduce((sum, w) => sum + Math.max(0, (new Date(w.end ?? new Date().toISOString()).getTime() - new Date(w.start).getTime())), 0) / 3600000;

    const statsFor = (intern: Intern): InternStats => {
      const assignedLeads = data.leads.filter((l) => l.internId === intern.id && !l.archived);
      const completed = data.followUps.filter((f) => f.internId === intern.id).length;
      const target = assignedLeads.length * 2 || 1;
      const converted = assignedLeads.filter((l) => l.status === "Converted").length;
      const rows = sessionsOf(intern.id);
      const t = today();
      const loggedTotal = hoursOf(rows);
      const loggedToday = hoursOf(rows.filter((w) => w.start.slice(0, 10) === t));
      const totalHours = Math.round((intern.workingHours + loggedTotal) * 10) / 10;
      return {
        intern,
        assigned: assignedLeads.length,
        completedFollowUps: completed,
        followUpRate: Math.min(100, Math.round((completed / target) * 100)),
        converted,
        conversionRate: assignedLeads.length ? Math.round((converted / assignedLeads.length) * 100) : 0,
        hours: totalHours,
        totalHours,
        todayHours: Math.round(loggedToday * 10) / 10,
      };
    };

    const allStats = visibleInterns.map(statsFor);

    const insightsFor = (id: string): InternInsights => {
      const s = allStats.find((x) => x.intern.id === id) ?? statsFor(data.interns.find((i) => i.id === id)!);
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      (s.conversionRate >= 25 ? strengths : weaknesses).push(
        s.conversionRate >= 25 ? `Strong conversion performance (${s.conversionRate}%)` : `Conversion performance needs work (${s.conversionRate}%)`,
      );
      (s.followUpRate >= 60 ? strengths : weaknesses).push(
        s.followUpRate >= 60 ? `Consistent follow-ups (${s.followUpRate}%)` : `Follow-ups falling behind (${s.followUpRate}%)`,
      );
      (s.assigned >= 3 ? strengths : weaknesses).push(
        s.assigned >= 3 ? `Handles a healthy pipeline (${s.assigned} leads)` : `Light pipeline (${s.assigned} leads)`,
      );
      (s.totalHours >= 40 ? strengths : weaknesses).push(
        s.totalHours >= 40 ? `Good time on the desk (${s.totalHours}h)` : `Low logged hours (${s.totalHours}h)`,
      );
      const overdue = data.leads.filter((l) => l.internId === id && !l.archived && l.nextFollowUp && l.nextFollowUp < today()).length;
      if (overdue > 0) weaknesses.push(`${overdue} overdue follow-up${overdue > 1 ? "s" : ""}`);
      return { strengths, weaknesses };
    };

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
      allLeads: allVisibleLeads,
      workSessions: data.workSessions,
      activeSession: currentIntern ? data.workSessions.find((w) => w.internId === currentIntern.id && !w.end) ?? null : null,
      startWork: () =>
        setData((d) => {
          if (!currentIntern || d.workSessions.some((w) => w.internId === currentIntern.id && !w.end)) return d;
          return { ...d, workSessions: [{ id: uid(), internId: currentIntern.id, start: new Date().toISOString() }, ...d.workSessions] };
        }),
      stopWork: () =>
        setData((d) => {
          if (!currentIntern) return d;
          let stopped = false;
          const workSessions = d.workSessions.map((w) => {
            if (!stopped && w.internId === currentIntern.id && !w.end) {
              stopped = true;
              return { ...w, end: new Date().toISOString() };
            }
            return w;
          });
          return stopped ? { ...d, workSessions } : d;
        }),
      insightsFor,
      archiveLead: (id: string, archived: boolean) =>
        setData((d) => {
          const lead = d.leads.find((l) => l.id === id);
          if (!lead) return d;
          return logActivity({ ...d, leads: d.leads.map((l) => (l.id === id ? { ...l, archived } : l)) }, {
            leadId: id,
            internId: lead.internId,
            type: "lead_updated",
            message: `${lead.company} was ${archived ? "archived" : "restored"}`,
          });
        }),
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
      changePassword: (current: string, next: string) => {
        const cur = current.trim();
        const nx = next.trim();
        if (nx.length < 4) return { ok: false, error: "New password must be at least 4 characters." };
        if (isFounder) {
          if (cur !== data.settings.adminPassword) return { ok: false, error: "Current password is incorrect." };
          setData((d) => ({ ...d, settings: { ...d.settings, adminPassword: nx } }));
          return { ok: true };
        }
        if (!currentIntern) return { ok: false, error: "You need to sign in first." };
        if (cur !== currentIntern.password) return { ok: false, error: "Current password is incorrect." };
        setData((d) => ({
          ...d,
          interns: d.interns.map((i) => (i.id === currentIntern.id ? { ...i, password: nx } : i)),
        }));
        return { ok: true };
      },
      setInternPassword: (internId: string, next: string) => {
        const nx = next.trim();
        if (nx.length < 4) return { ok: false, error: "New password must be at least 4 characters." };
        setData((d) => ({
          ...d,
          interns: d.interns.map((i) => (i.id === internId ? { ...i, password: nx } : i)),
        }));
        return { ok: true };
      },

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
      addIntern: (i) => {
        const email = i.email.trim().toLowerCase();
        const phone = i.phone.replace(/\s+/g, "");
        const clash = data.interns.some(
          (x) =>
            (email && x.email.trim().toLowerCase() === email) ||
            (phone && x.phone.replace(/\s+/g, "") === phone),
        );
        if (clash) {
          return { ok: false, error: "This email or phone number is already in use. Please use a different email or phone number." };
        }
        setData((d) => {
          const nextNum =
            d.interns.reduce((max, x) => Math.max(max, Number(x.code.replace(/[^0-9]/g, "")) || 0), 0) + 1;
          const intern: Intern = { ...i, id: uid(), code: `Intern ${nextNum}` };
          return logActivity({ ...d, interns: [...d.interns, intern] }, {
            internId: intern.id,
            type: "intern_added",
            message: `${intern.code} (${intern.name}) joined ${intern.department}`,
          });
        });
        return { ok: true };
      },
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
