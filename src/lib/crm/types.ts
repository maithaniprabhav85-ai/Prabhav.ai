export type LeadStatus = "New" | "Contacted" | "Follow-up" | "Qualified" | "Converted" | "Lost";
export type LeadPriority = "Hot" | "Warm" | "Cold";

export const LEAD_STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Follow-up",
  "Qualified",
  "Converted",
  "Lost",
];
export const LEAD_PRIORITIES: LeadPriority[] = ["Hot", "Warm", "Cold"];
export const INDUSTRIES = [
  "SaaS",
  "Fintech",
  "Healthcare",
  "Manufacturing",
  "Education",
  "Retail",
  "Logistics",
];
export const DEPARTMENTS = ["Sales", "Marketing", "Operations", "Research", "Support"];
export const DESIGNATIONS = ["Sales Intern", "Marketing Intern", "Research Intern", "Ops Intern", "Team Lead"];

export interface Intern {
  id: string;
  /** Assignment ID shown across leads, e.g. "Intern 1" */
  code: string;
  name: string;
  department: string;
  designation: string;
  email: string;
  phone: string;
  startDate: string;
  workingHours: number;
  /** Login password for this intern (demo-only, stored locally) */
  password: string;
  /** True while this intern is signed in on this device */
  online?: boolean;
}

export interface WorkSession {
  id: string;
  internId: string;
  start: string; // ISO datetime
  end?: string; // ISO datetime, absent while running
}

export interface Lead {
  id: string;
  archived?: boolean;
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  location: string;
  status: LeadStatus;
  priority: LeadPriority;
  internId: string;
  nextFollowUp: string; // ISO date (yyyy-mm-dd) or ""
  notes: string;
  createdAt: string; // ISO datetime
}

export interface Activity {
  id: string;
  leadId?: string;
  internId?: string;
  type:
    | "lead_created"
    | "lead_updated"
    | "lead_deleted"
    | "followup_completed"
    | "followup_rescheduled"
    | "intern_added"
    | "intern_updated"
    | "intern_deleted";
  message: string;
  createdAt: string;
}

export interface FollowUpLog {
  id: string;
  leadId: string;
  internId: string;
  completedAt: string;
}

export interface Settings {
  role: "Founder" | "Intern";
  companyName: string;
  defaultFollowUpDays: number;
  compactTable: boolean;
  notifyOverdue: boolean;
  notifyUpcoming: boolean;
  adminId: string;
  adminEmail: string;
  adminPassword: string;
}

export type Session = { role: "Founder"; internId: null } | { role: "Intern"; internId: string };

export interface CrmData {
  interns: Intern[];
  leads: Lead[];
  activities: Activity[];
  followUps: FollowUpLog[];
  workSessions: WorkSession[];
  settings: Settings;
  readNotificationIds: string[];
  session: Session | null;
}
