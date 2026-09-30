import { Chart, registerables, ChartConfiguration } from "chart.js";
import { CATEGORIES, CATEGORY_LABELS, money, moneyShort, dayLabel } from "#app/shared/format";
import type { Dashboard } from "./services";

Chart.register(...registerables);

export type ChartKind = "attainment" | "categories" | "trend";

const charts = new Map<ChartKind, Chart>();

interface Tokens {
  closed: string;
  commit: string;
  bestCase: string;
  pipeline: string;
  series1: string;
  series2: string;
  reference: string;
  marker: string;
  grid: string;
  axis: string;
  surface: string;
  font: string;
}

function readTokens(el: Element): Tokens {
  let style = getComputedStyle(el);
  let v = (name: string) => style.getPropertyValue(name).trim();

  return {
    closed: v("--viz-closed"),
    commit: v("--viz-commit"),
    bestCase: v("--viz-best-case"),
    pipeline: v("--viz-pipeline"),
    series1: v("--viz-series-1"),
    series2: v("--viz-series-2"),
    reference: v("--viz-reference"),
    marker: v("--viz-marker"),
    grid: v("--viz-grid"),
    axis: v("--viz-axis"),
    surface: v("--viz-surface"),
    font: getComputedStyle(document.body).fontFamily,
  };
}

function moneyAxis(t: Tokens, beginAtZero: boolean) {
  return {
    beginAtZero,
    grid: { color: t.grid },
    border: { display: false },
    ticks: { color: t.axis, callback: (value: string | number) => moneyShort(Number(value)) },
  };
}

function categoryAxis(t: Tokens) {
  return {
    grid: { display: false },
    border: { color: t.grid },
    ticks: { color: t.axis, maxRotation: 0, autoSkipPadding: 12 },
  };
}

function base(t: Tokens) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        position: "top" as const,
        align: "start" as const,
        labels: {
          color: t.axis,
          usePointStyle: true,
          pointStyle: "rectRounded",
          boxWidth: 10,
          boxHeight: 10,
          padding: 16,
          sort: (a: any, b: any) => a.datasetIndex - b.datasetIndex,
        },
      },
      tooltip: {
        itemSort: (a: any, b: any) => a.datasetIndex - b.datasetIndex,
        callbacks: {
          label: (ctx: any) => ctx.parsed.y === null ? "" : `${ctx.dataset.label}: ${money(ctx.parsed.y)}`,
        },
      },
    },
  };
}

function attainment(d: Dashboard, t: Tokens): ChartConfiguration {
  return {
    type: "line",
    data: {
      labels: d.weeks.map((w) => dayLabel(w.weekOf)),
      datasets: [
        {
          label: "Closed won",
          data: d.weeks.map((w) => w.closed),
          borderColor: t.series1,
          backgroundColor: t.series1,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBorderColor: t.surface,
          pointBorderWidth: 2,
          tension: 0.2,
        },
        {
          label: "Quota",
          data: d.weeks.map(() => d.team.quota),
          borderColor: t.reference,
          backgroundColor: t.reference,
          borderWidth: 1.5,
          borderDash: [6, 4],
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    },
    options: {
      ...base(t),
      scales: { x: categoryAxis(t), y: moneyAxis(t, true) },
    },
  };
}

function categories(d: Dashboard, t: Tokens): ChartConfiguration {
  let colors = { closed: t.closed, commit: t.commit, bestCase: t.bestCase, pipeline: t.pipeline };

  return {
    type: "bar",
    data: {
      labels: d.reps.map((r) => r.name.split(" ")[0]),
      datasets: [
        ...CATEGORIES.map((c) => ({
          type: "bar" as const,
          label: CATEGORY_LABELS[c],
          data: d.reps.map((r) => r[c]),
          backgroundColor: colors[c],
          borderColor: t.surface,
          borderWidth: { top: 2, bottom: 0, left: 0, right: 0 },
          borderSkipped: false as const,
          stack: "forecast",
          maxBarThickness: 48,
        })),
        {
          type: "line" as const,
          label: "Quota",
          data: d.reps.map((r) => r.quota),
          stack: "quota",
          // Drawn after the bars; otherwise a quota inside a bar is hidden.
          order: -1,
          showLine: false,
          pointStyle: "line",
          // Half a bar's slot, so the ticks stay inside their bars on a phone.
          pointRadius: (ctx: any) => Math.min(20, ctx.chart.width / Math.max(d.reps.length, 1) / 3.2),
          pointHoverRadius: (ctx: any) => Math.min(20, ctx.chart.width / Math.max(d.reps.length, 1) / 3.2),
          pointBorderWidth: 3,
          borderColor: t.marker,
          backgroundColor: t.marker,
        },
      ],
    },
    options: {
      ...base(t),
      scales: {
        x: { ...categoryAxis(t), stacked: true },
        y: { ...moneyAxis(t, true), stacked: true },
      },
    },
  } as ChartConfiguration;
}

function trend(d: Dashboard, t: Tokens): ChartConfiguration {
  return {
    type: "line",
    data: {
      labels: d.trend.map((p) => p.label === "now" ? "Now" : dayLabel(p.label)),
      datasets: [
        {
          label: "Deals: closed + commit",
          data: d.trend.map((p) => p.forecastCommit),
          borderColor: t.series1,
          backgroundColor: t.series1,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBorderColor: t.surface,
          pointBorderWidth: 2,
          tension: 0.2,
        },
        {
          label: "Called commit",
          data: d.trend.map((p) => p.calledCommit),
          borderColor: t.series2,
          backgroundColor: t.series2,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBorderColor: t.surface,
          pointBorderWidth: 2,
          pointStyle: "rectRot",
          tension: 0.2,
          spanGaps: true,
        },
        {
          label: "Quota",
          data: d.trend.map(() => d.team.quota),
          borderColor: t.reference,
          backgroundColor: t.reference,
          borderWidth: 1.5,
          borderDash: [6, 4],
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    },
    options: {
      ...base(t),
      scales: { x: categoryAxis(t), y: moneyAxis(t, false) },
    },
  };
}

const builders: Record<ChartKind, (d: Dashboard, t: Tokens) => ChartConfiguration> = {
  attainment,
  categories,
  trend,
};

export function mountChart(kind: ChartKind, canvas: HTMLCanvasElement, data: Dashboard) {
  charts.get(kind)?.destroy();

  let t = readTokens(canvas);
  Chart.defaults.font.family = t.font;
  charts.set(kind, new Chart(canvas, builders[kind](data, t)));
}

export function unmountChart(kind: ChartKind) {
  charts.get(kind)?.destroy();
  charts.delete(kind);
}

/** Swaps the numbers in place so the marks animate to their new values. */
export function refreshCharts(data: Dashboard) {
  for (let [kind, chart] of charts) {
    let next = builders[kind](data, readTokens(chart.canvas));

    chart.data.labels = next.data.labels;
    next.data.datasets.forEach((dataset, i) => {
      if (chart.data.datasets[i]) {
        chart.data.datasets[i].data = dataset.data;
      }
    });
    chart.update();
  }
}
