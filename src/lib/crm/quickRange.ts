export type QuickRange = "today" | "week" | "month";

const pad = (n: number) => String(n).padStart(2, "0");
const local = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** Returns [from, to] as datetime-local strings for a quick preset. */
export function quickRange(kind: QuickRange): [string, string] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (kind === "week") start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  if (kind === "month") start.setDate(1);
  return [local(start), local(now)];
}

export const QUICK_RANGES: { key: QuickRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
];
