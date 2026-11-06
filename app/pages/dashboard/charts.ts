import type { ChartConfig } from "@elements/ui/chart";
import { CATEGORIES, money, moneyShort, dayLabel } from "#app/shared/format";
import type { Dashboard } from "./services";

/** Most certain darkest: closed, commit, best case, pipeline. Dark mode flips the ramp. */
export const CATEGORY_CONFIG: ChartConfig = {
  closed: { label: "Closed", theme: { light: "var(--brand-700)", dark: "var(--brand-200)" } },
  commit: { label: "Commit", theme: { light: "var(--brand-500)", dark: "var(--brand-400)" } },
  bestCase: { label: "Best case", theme: { light: "var(--brand-400)", dark: "var(--brand-500)" } },
  pipeline: { label: "Pipeline", theme: { light: "var(--brand-300)", dark: "var(--brand-700)" } },
  quota: { label: "Quota", color: "var(--ink)" },
};

/** The quota is a dashed reference line with no dots. */
const QUOTA = { label: "Quota", color: "var(--ink-dim)", strokeDasharray: "6 4", dots: false };

export const ATTAINMENT_CONFIG: ChartConfig = {
  closed: { label: "Closed won", color: "var(--accent)" },
  quota: QUOTA,
};

export const TREND_CONFIG: ChartConfig = {
  forecastCommit: { label: "Deals: closed + commit", color: "var(--accent)" },
  calledCommit: { label: "Called commit", color: "var(--warning-500)" },
  quota: QUOTA,
};

export const SERIES = CATEGORIES as string[];

export const moneyAxis = { tickFormatter: (value: unknown) => moneyShort(Number(value)), tickLine: false, axisLine: false };

export const legend = { position: "top" as const, align: "left" as const };

export const tooltip = { formatter: (value: unknown) => value === null || value === undefined ? "–" : money(Number(value)) };

export function attainmentRows(d: Dashboard) {
  return d.weeks.map((w) => ({ week: dayLabel(w.weekOf), closed: w.closed, quota: d.team.quota }));
}

export function trendRows(d: Dashboard) {
  return d.trend.map((p) => ({
    week: p.label === "now" ? "Now" : dayLabel(p.label),
    forecastCommit: p.forecastCommit,
    calledCommit: p.calledCommit,
    quota: d.team.quota,
  }));
}

export function categoryRows(d: Dashboard) {
  return d.reps.map((r) => ({
    rep: r.name.split(" ")[0],
    closed: r.closed,
    commit: r.commit,
    bestCase: r.bestCase,
    pipeline: r.pipeline,
    quota: r.quota,
  }));
}
