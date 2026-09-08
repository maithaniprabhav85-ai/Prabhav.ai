import { createContext, useContext, type Context } from "react";
import type { Activity, CrmData, FollowUpLog, Intern, Lead, Session, Settings, WorkSession } from "./types";

export interface InternStats {
  intern: Intern;
  assigned: number;
  completedFollowUps: number;
  followUpRate: number;
  converted: number;
  conversionRate: number;
  hours: number;
  todayHours: number;
  totalHours: number;
}

export interface InternInsights {
  strengths: string[];
  weaknesses: string[];
}

export interface CrmNotification {
  id: string;
  kind: "overdue" | "upcoming" | "update";
  title: string;
  body: string;
  at: string;
}

export interface Ctx {
  data: CrmData;
  hydrated: boolean;
  interns: Intern[];
  leads: Lead[];
  activities: Activity[];
  followUps: FollowUpLog[];
  settings: Settings;
  session: Session | null;
  isFounder: boolean;
  currentIntern: Intern | null;
  signIn: (userId: string, password: string) => boolean;
  signOut: () => void;
  changePassword: (current: string, next: string) => { ok: boolean; error?: string };
  setInternPassword: (internId: string, next: string) => { ok: boolean; error?: string };

  addLead: (l: Omit<Lead, "id" | "createdAt">) => void;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  archiveLead: (id: string, archived: boolean) => void;
  allLeads: Lead[];
  workSessions: WorkSession[];
  activeSession: WorkSession | null;
  startWork: () => void;
  stopWork: () => void;
  insightsFor: (id: string) => InternInsights;
  addIntern: (i: Omit<Intern, "id" | "code">) => { ok: boolean; error?: string };
  updateIntern: (id: string, patch: Partial<Omit<Intern, "id" | "code">>) => void;
  deleteIntern: (id: string) => void;
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

type CrmGlobal = typeof globalThis & {
  __internLeadCrmContext?: Context<Ctx | null>;
};

// Keep one context identity across Vite hot updates. Without this, the provider
// can temporarily retain the old module's context while consumers use the new
// one, making a correctly nested consumer appear to be outside its provider.
const crmGlobal = globalThis as CrmGlobal;
const existingContext = crmGlobal.__internLeadCrmContext;

export const CrmContext = existingContext ?? createContext<Ctx | null>(null);

if (!existingContext) {
  crmGlobal.__internLeadCrmContext = CrmContext;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error("useCrm must be used inside CrmProvider");
  return ctx;
}
