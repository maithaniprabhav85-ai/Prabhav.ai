import type { LeadPriority, LeadStatus } from "./types";

export type ThemeColorKey =
  | "background"
  | "sidebarBackground"
  | "headerBackground"
  | "cardBackground"
  | "primaryButton"
  | "secondaryButton"
  | "text"
  | "heading"
  | "border"
  | "accent"
  | "hoverBackground"
  | "activeNavigation";

export type ThemeColors = Record<ThemeColorKey, string>;

export interface ThemePreset {
  id: string;
  name: string;
  colors: ThemeColors;
}

const classicColors: ThemeColors = {
  background: "#F6F8FC",
  sidebarBackground: "#172C48",
  headerBackground: "#FFFFFF",
  cardBackground: "#FFFFFF",
  primaryButton: "#2563EB",
  secondaryButton: "#EAF2FF",
  text: "#334155",
  heading: "#0F2747",
  border: "#DCE4EF",
  accent: "#3B82F6",
  hoverBackground: "#EEF4FF",
  activeNavigation: "#2563EB",
};

export const THEME_PRESETS: ThemePreset[] = [
  { id: "classic-light", name: "Classic Light", colors: classicColors },
  {
    id: "midnight-black",
    name: "Midnight Black",
    colors: {
      background: "#15171B",
      sidebarBackground: "#090B0F",
      headerBackground: "#1C1F25",
      cardBackground: "#20242B",
      primaryButton: "#4F8CFF",
      secondaryButton: "#303640",
      text: "#D7DCE5",
      heading: "#F3F5F8",
      border: "#363C46",
      accent: "#64A0FF",
      hoverBackground: "#2A3039",
      activeNavigation: "#4F8CFF",
    },
  },
  {
    id: "pure-white",
    name: "Pure White",
    colors: {
      ...classicColors,
      background: "#FFFFFF",
      sidebarBackground: "#FFFFFF",
      headerBackground: "#FFFFFF",
      cardBackground: "#FFFFFF",
      text: "#3F4753",
      heading: "#202B3A",
      border: "#E7E9ED",
      hoverBackground: "#F5F7FA",
    },
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    colors: {
      ...classicColors,
      background: "#EDF5FC",
      sidebarBackground: "#103B63",
      headerBackground: "#F7FBFF",
      cardBackground: "#FFFFFF",
      primaryButton: "#0878B9",
      secondaryButton: "#DDEFFC",
      heading: "#0D3556",
      border: "#C8DDEA",
      accent: "#21A5CC",
      hoverBackground: "#E1F2FA",
      activeNavigation: "#1188C5",
    },
  },
];

export const THEME_COLOR_FIELDS: { key: ThemeColorKey; label: string }[] = [
  { key: "background", label: "Main background" },
  { key: "sidebarBackground", label: "Sidebar background" },
  { key: "headerBackground", label: "Header background" },
  { key: "cardBackground", label: "Card background" },
  { key: "primaryButton", label: "Primary button" },
  { key: "secondaryButton", label: "Secondary button" },
  { key: "text", label: "Text" },
  { key: "heading", label: "Heading" },
  { key: "border", label: "Border" },
  { key: "accent", label: "Accent" },
  { key: "hoverBackground", label: "Hover background" },
  { key: "activeNavigation", label: "Active navigation" },
];

export type FeatureRole = "admin" | "intern";

export interface CrmFeature {
  id: string;
  name: string;
  description: string;
  category: string;
  role: FeatureRole;
  version: string;
  releaseDate: string;
  approved: boolean;
  globallyEnabled: boolean;
  removed: boolean;
  defaultActive: boolean;
  updatedAt: string;
}

export interface PersonalTask {
  id: string;
  accountKey: string;
  title: string;
  dueDate: string;
  priority: "Low" | "Normal" | "High";
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalLeadNote {
  id: string;
  accountKey: string;
  leadId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedLeadFilter {
  id: string;
  accountKey: string;
  name: string;
  query: string;
  status: LeadStatus | "all";
  priority: LeadPriority | "all";
  createdAt: string;
}

export interface CrmEcosystem {
  themes: {
    byAccount: Record<string, string>;
    customColorsByAccount: Record<string, ThemeColors>;
    customPresets: ThemePreset[];
    internApprovedThemeIds: string[];
  };
  features: CrmFeature[];
  featurePreferences: Record<string, Record<string, boolean>>;
  releaseSettings: {
    initialDate: string;
    intervalDays: number;
    paused: boolean;
  };
  automations: {
    overdueReminders: boolean;
    upcomingReminders: boolean;
    leadStatusWorkflow: boolean;
    assignmentNotifications: boolean;
    internActivityAlerts: boolean;
    newLeadNotifications: boolean;
  };
  tasks: PersonalTask[];
  leadNotes: PersonalLeadNote[];
  savedFilters: SavedLeadFilter[];
  activeSavedFilterByAccount: Record<string, string>;
}

export const INTERN_FEATURES = [
  { id: "personal-performance", name: "Personal Performance Dashboard", description: "Your assigned pipeline, conversion rate, overdue follow-ups, recent activity, and weekly progress.", category: "Performance" },
  { id: "smart-lead-notes", name: "Smart Lead Notes", description: "Timestamped personal notes connected to your assigned leads, with search.", category: "Lead management" },
  { id: "follow-up-planner", name: "Personal Follow-up Planner", description: "Organize your existing due, upcoming, overdue, and completed follow-ups.", category: "Planning" },
  { id: "daily-checklist", name: "Daily Task Checklist", description: "Keep a private-in-this-browser checklist with due dates and priorities.", category: "Planning" },
  { id: "duplicate-detector", name: "Duplicate Lead Detector", description: "Check your visible assigned leads for matching company, email, or phone.", category: "Lead management" },
  { id: "personal-reports", name: "Personal Performance Reports", description: "Review your daily, weekly, and monthly lead and follow-up results.", category: "Reporting" },
  { id: "saved-filters", name: "Saved Lead Filters", description: "Save, rename, and apply your frequent lead searches.", category: "Lead management" },
] as const;

export const ADMIN_FEATURES = [
  { id: "team-analytics", name: "Advanced Team Analytics", description: "Date-filtered lead, conversion, follow-up, status, and productivity summaries.", category: "Analytics" },
  { id: "performance-intelligence", name: "Intern Performance Intelligence", description: "Compare intern lead volume, conversions, follow-ups, activity, and trends.", category: "Analytics" },
  { id: "lead-distribution", name: "Smart Lead Distribution", description: "Assign or redistribute selected leads manually, evenly, or to least-loaded interns.", category: "Lead operations" },
  { id: "audit-logs", name: "Advanced Audit Logs", description: "Filter existing activity records and locally recorded feature-management actions.", category: "Oversight" },
  { id: "bulk-leads", name: "Bulk Lead Operations", description: "Select leads to assign, update, export, or import with duplicate review.", category: "Lead operations" },
  { id: "workflow-automation", name: "Workflow Automation Manager", description: "Manage in-app reminder preferences and review automation readiness.", category: "Workflow" },
  { id: "feature-access", name: "Intern Feature Access Control", description: "Approve, enable, schedule, or remove intern tools while preserving personal data.", category: "Access" },
] as const;

const dayString = (date: Date) => date.toISOString().slice(0, 10);

export function createDefaultEcosystem(startDate = dayString(new Date())): CrmEcosystem {
  const now = new Date().toISOString();
  const features: CrmFeature[] = [
    ...INTERN_FEATURES.map((feature) => ({ ...feature, role: "intern" as const, version: "1.0", releaseDate: startDate, approved: true, globallyEnabled: true, removed: false, defaultActive: true, updatedAt: now })),
    ...ADMIN_FEATURES.map((feature) => ({ ...feature, role: "admin" as const, version: "1.0", releaseDate: startDate, approved: true, globallyEnabled: true, removed: false, defaultActive: true, updatedAt: now })),
  ];
  return {
    themes: {
      byAccount: {},
      customColorsByAccount: {},
      customPresets: [],
      internApprovedThemeIds: ["classic-light", "pure-white", "ocean-blue"],
    },
    features,
    featurePreferences: {},
    releaseSettings: { initialDate: startDate, intervalDays: 10, paused: false },
    automations: {
      overdueReminders: true,
      upcomingReminders: true,
      leadStatusWorkflow: false,
      assignmentNotifications: false,
      internActivityAlerts: false,
      newLeadNotifications: false,
    },
    tasks: [],
    leadNotes: [],
    savedFilters: [],
    activeSavedFilterByAccount: {},
  };
}

export function normalizeEcosystem(raw?: Partial<CrmEcosystem> | null): CrmEcosystem {
  const defaults = createDefaultEcosystem();
  if (!raw) return defaults;
  const byId = new Map(defaults.features.map((feature) => [feature.id, feature]));
  for (const feature of raw.features ?? []) byId.set(feature.id, { ...byId.get(feature.id), ...feature });
  return {
    ...defaults,
    ...raw,
    themes: {
      ...defaults.themes,
      ...raw.themes,
      byAccount: raw.themes?.byAccount ?? {},
      customColorsByAccount: raw.themes?.customColorsByAccount ?? {},
      customPresets: raw.themes?.customPresets ?? [],
      internApprovedThemeIds: raw.themes?.internApprovedThemeIds ?? defaults.themes.internApprovedThemeIds,
    },
    features: [...byId.values()],
    featurePreferences: raw.featurePreferences ?? {},
    releaseSettings: { ...defaults.releaseSettings, ...raw.releaseSettings },
    automations: { ...defaults.automations, ...raw.automations },
    tasks: raw.tasks ?? [],
    leadNotes: raw.leadNotes ?? [],
    savedFilters: raw.savedFilters ?? [],
    activeSavedFilterByAccount: raw.activeSavedFilterByAccount ?? {},
  };
}

export function addDays(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime())) return date;
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return dayString(parsed);
}

export function nextReleaseDate(initialDate: string, intervalDays: number, today = dayString(new Date())): string {
  const safeInterval = Math.max(1, Math.floor(intervalDays) || 10);
  const start = new Date(`${initialDate}T00:00:00Z`).getTime();
  const current = new Date(`${today}T00:00:00Z`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(current)) return initialDate;
  const elapsed = Math.floor((current - start) / 86400000);
  const slot = Math.max(0, Math.floor(elapsed / safeInterval) + 1);
  return addDays(initialDate, slot * safeInterval);
}

export function isFeatureReleased(
  feature: CrmFeature,
  today = dayString(new Date()),
  paused = false,
  initialDate = today,
): boolean {
  if (feature.releaseDate <= initialDate) return true;
  return !paused && feature.releaseDate <= today;
}

export const THEME_CSS_VARS: Record<ThemeColorKey, string> = {
  background: "--background",
  sidebarBackground: "--sidebar",
  headerBackground: "--header-background",
  cardBackground: "--card",
  primaryButton: "--primary",
  secondaryButton: "--secondary",
  text: "--foreground",
  heading: "--navy",
  border: "--border",
  accent: "--accent",
  hoverBackground: "--sidebar-accent",
  activeNavigation: "--sidebar-primary",
};

export function themeCssProperties(colors: ThemeColors): Record<string, string> {
  const luminance = (hex: string) => {
    const value = hex.replace("#", "");
    if (!/^[0-9a-fA-F]{6}$/.test(value)) return 1;
    const channels = [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16) / 255);
    const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  };
  const contrast = (hex: string) => luminance(hex) > 0.48 ? "#172033" : "#FFFFFF";
  const sidebarText = contrast(colors.sidebarBackground);
  const primaryText = contrast(colors.primaryButton);
  const secondaryText = contrast(colors.secondaryButton);
  return {
    ...Object.fromEntries(Object.entries(THEME_CSS_VARS).map(([key, variable]) => [variable, colors[key as ThemeColorKey]])),
    "--card-foreground": colors.text,
    "--header-background": colors.headerBackground,
    "--popover": colors.cardBackground,
    "--popover-foreground": colors.text,
    "--navy-foreground": contrast(colors.heading),
    "--primary-foreground": primaryText,
    "--secondary-foreground": secondaryText,
    "--accent-foreground": colors.text,
    "--sidebar-foreground": sidebarText,
    "--sidebar-accent-foreground": sidebarText,
    "--sidebar-primary-foreground": contrast(colors.activeNavigation),
    "--sidebar-border": colors.border,
    "--sidebar-ring": colors.accent,
    "--ring": colors.accent,
    "--input": colors.border,
  };
}