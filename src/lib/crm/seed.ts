import type { CrmData, Lead, LeadPriority, LeadStatus } from "./types";

const day = 86400000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * day).toISOString();
const dateOnly = (offsetDays: number) => iso(offsetDays).slice(0, 10);

const internNames = [
  "Aarav Sharma",
  "Diya Kapoor",
  "Rohan Mehta",
  "Sana Iyer",
  "Kabir Nanda",
  "Ishita Roy",
  "Vivaan Grover",
  "Tara Menon",
  "Yash Chawla",
  "Nikita Bhatt",
];

const departments = ["Sales", "Marketing", "Operations", "Research", "Support"];
const designations = ["Sales Intern", "Marketing Intern", "Research Intern", "Ops Intern", "Team Lead"];

const interns = internNames.map((name, i) => ({
  id: `in-${i + 1}`,
  code: String(i + 1).padStart(3, "0"),
  name,
  department: departments[i % departments.length]!,
  designation: designations[i % designations.length]!,
  password: `intern${i + 1}`,
  online: false,
  email: `${name.split(" ")[0]!.toLowerCase()}@leadpilot.io`,
  phone: `+91 9${String(811000000 + i * 3210987).slice(0, 9)}`,
  startDate: dateOnly(-96 + i * 9),
  workingHours: 184 - i * 14,
}));

const raw: Array<[string, string, string, string, string, LeadStatus, LeadPriority, string, number, number]> = [
  ["Northwind Analytics", "Priya Nair", "SaaS", "Bengaluru", "in-1", "Converted", "Hot", "Signed annual plan after 3 calls.", -34, -2],
  ["Cobalt Fintech", "Rahul Verma", "Fintech", "Mumbai", "in-1", "Qualified", "Hot", "Budget approved, waiting on legal.", -28, 0],
  ["Helix Health", "Dr. Anita Rao", "Healthcare", "Hyderabad", "in-2", "Follow-up", "Warm", "Needs compliance doc before demo.", -25, -1],
  ["Ferro Manufacturing", "Suresh Patel", "Manufacturing", "Ahmedabad", "in-2", "Contacted", "Cold", "Gatekeeper only, retry next quarter.", -22, 6],
  ["BrightPath Edu", "Meera Joshi", "Education", "Pune", "in-3", "New", "Warm", "Inbound from webinar list.", -12, 1],
  ["Kestrel Retail", "Vikram Singh", "Retail", "Delhi", "in-3", "Follow-up", "Hot", "Pilot for 12 stores discussed.", -18, 0],
  ["Sablon Logistics", "Neha Gupta", "Logistics", "Chennai", "in-4", "Contacted", "Warm", "Asked for pricing sheet.", -9, 3],
  ["Vertex Cloud", "Arjun Das", "SaaS", "Noida", "in-1", "Lost", "Cold", "Chose a competitor.", -40, -6],
  ["Lumen Payments", "Kavya Reddy", "Fintech", "Bengaluru", "in-2", "Converted", "Hot", "Upsell opportunity in Q3.", -31, -4],
  ["Orion Diagnostics", "Farhan Ali", "Healthcare", "Kolkata", "in-4", "New", "Cold", "Cold email sent, no reply yet.", -5, 2],
  ["Ironclad Tools", "Deepak Rana", "Manufacturing", "Ludhiana", "in-3", "Qualified", "Warm", "Demo scheduled with plant head.", -16, 4],
  ["Skyline Academy", "Ritu Malhotra", "Education", "Jaipur", "in-1", "Follow-up", "Warm", "Wants case studies.", -14, -3],
  ["Crate & Cart", "Ankit Bose", "Retail", "Surat", "in-4", "Contacted", "Hot", "Very responsive on WhatsApp.", -7, 0],
  ["Transway Freight", "Leela Menon", "Logistics", "Kochi", "in-2", "New", "Cold", "Referral from Sablon.", -3, 5],
];

const leads: Lead[] = raw.map((r, i) => ({
  id: `ld-${i + 1}`,
  company: r[0],
  contactPerson: r[1],
  email: `${r[1].split(" ").pop()!.toLowerCase()}@${r[0].split(" ")[0]!.toLowerCase()}.com`,
  phone: `+91 9${String(700000000 + i * 1234567).slice(0, 9)}`,
  industry: r[2],
  location: r[3],
  internId: r[4],
  status: r[5],
  priority: r[6],
  notes: r[7],
  createdAt: iso(r[8]),
  nextFollowUp: r[5] === "Converted" || r[5] === "Lost" ? "" : dateOnly(r[9]),
}));

const followUps = leads.slice(0, 9).flatMap((l, i) =>
  Array.from({ length: (i % 3) + 1 }, (_, k) => ({
    id: `fu-${l.id}-${k}`,
    leadId: l.id,
    internId: l.internId,
    completedAt: iso(-(i + k + 2)),
  })),
);

const activities = [...leads]
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  .slice(0, 10)
  .map((l, i) => ({
    id: `ac-${i}`,
    leadId: l.id,
    internId: l.internId,
    type: "lead_created" as const,
    message: `${interns.find((x) => x.id === l.internId)?.code ?? "Someone"} added lead ${l.company}`,
    createdAt: l.createdAt,
  }));

export const seedData: CrmData = {
  interns,
  leads,
  activities,
  followUps,
  workSessions: [],
  readNotificationIds: [],
  session: null,
  settings: {
    role: "Founder",
    companyName: "LeadPilot CRM",
    defaultFollowUpDays: 3,
    compactTable: false,
    notifyOverdue: true,
    notifyUpcoming: true,
    adminId: "admin",
    adminEmail: "admin@pixelinfinite.ai",
    adminPassword: "admin123",
  },
};
