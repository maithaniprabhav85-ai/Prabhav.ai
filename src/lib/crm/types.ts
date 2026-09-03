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

export interface Intern {
  id: string;
  name: string;
  email: string;
  phone: string;
  startDate: string;
  workingHours: number;
}

export interface Lead {
  id: string;
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
  type: "lead_created" | "lead_updated" | "lead_deleted" | "followup_completed" | "followup_rescheduled" | "intern_added";
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
}

export interface CrmData {
  interns: Intern[];
  leads: Lead[];
  activities: Activity[];
  followUps: FollowUpLog[];
  settings: Settings;
  readNotificationIds: string[];
}
