import { createContext, useContext } from "react";
import type { Activity, CrmData, FollowUpLog, Intern, Lead, Settings } from "./types";

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
  addIntern: (i: Omit<Intern, "id" | "code">) => void;
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

export const CrmContext = createContext<Ctx | null>(null);

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error("useCrm must be used inside CrmProvider");
  return ctx;
}

