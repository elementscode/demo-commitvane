import type { Category } from "#app/shared/services/forecast";

export const CATEGORY_LABELS: Record<Category, string> = {
  closed: "Closed",
  commit: "Commit",
  bestCase: "Best case",
  pipeline: "Pipeline",
};

/** Most certain first: the order of every legend, stack and select. */
export const CATEGORIES: Category[] = ["closed", "commit", "bestCase", "pipeline"];

export function money(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

/** $1.09M, $412k, $900. For tiles and chart axes where width is tight. */
export function moneyShort(n: number): string {
  let abs = Math.abs(n);
  let sign = n < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  }

  if (abs >= 1_000) {
    return `${sign}$${Math.round(abs / 1_000)}k`;
  }

  return `${sign}$${Math.round(abs)}`;
}

export function percent(part: number, whole: number): string {
  if (!whole) {
    return "–";
  }

  return `${Math.round((part / whole) * 100)}%`;
}

/** "2026-07-01" to "Q3 2026". */
export function quarterLabel(quarter: string): string {
  let [year, month] = quarter.split("-").map(Number);
  return `Q${Math.floor((month - 1) / 3) + 1} ${year}`;
}

/** "2026-09-28" to "Sep 28", read as a calendar date, not a UTC instant. */
export function dayLabel(date: string): string {
  let [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function whenLabel(at: Date): string {
  return new Date(at).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/** Today as YYYY-MM-DD in the viewer's time zone. */
export function todayISO(): string {
  let now = new Date();
  let month = String(now.getMonth() + 1).padStart(2, "0");
  let day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
