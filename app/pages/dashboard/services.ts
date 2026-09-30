import { sql, ValidationError } from "@elements/app";
import { currentUserOrThrow } from "#app/shared/services/auth";
import { activeQuarter, repNumbers, RepNumbers } from "#app/shared/services/forecast";
import type { Totals } from "#app/shared/templates/stats/template";

export interface WeekClosed {
  weekOf: string;
  closed: number | null;
}

export interface TrendPoint {
  label: string;
  forecastCommit: number;
  calledCommit: number | null;
}

export interface Dashboard {
  quarter: string;
  quarters: string[];
  team: Totals & { callCommit: number; callBestCase: number; calls: number; calledThisWeek: number };
  reps: RepNumbers[];
  weeks: WeekClosed[];
  trend: TrendPoint[];
}

function teamTotals(reps: RepNumbers[]): Dashboard["team"] {
  let team = { quota: 0, closed: 0, commit: 0, bestCase: 0, pipeline: 0, weighted: 0, callCommit: 0, callBestCase: 0, calls: 0, calledThisWeek: 0 };

  for (let r of reps) {
    team.quota += r.quota;
    team.closed += r.closed;
    team.commit += r.commit;
    team.bestCase += r.bestCase;
    team.pipeline += r.pipeline;
    team.weighted += r.weighted;

    if (r.calledThisWeek) {
      team.calledThisWeek++;
    }

    if (r.callCommit !== null) {
      team.callCommit += r.callCommit;
      team.callBestCase += r.callBestCase ?? 0;
      team.calls++;
    }
  }

  return team;
}

/** Closed won to date at the end of each week of the quarter; null for weeks not yet reached. */
function weeklyClosed(quarter: string): WeekClosed[] {
  return sql<WeekClosed>(
    `select w::date::text as weekOf,
            case when w::date > current_date then null else (
              select coalesce(sum(amount), 0)::int
                from deals
               where category = 'closed'
                 and closeDate >= ${quarter}::date
                 and closeDate < least(w::date + 7, ${quarter}::date + interval '3 months')
            ) end as closed
       from generate_series(
              date_trunc('week', ${quarter}::date),
              ${quarter}::date + interval '3 months' - interval '1 day',
              interval '1 week'
            ) w
      order by w`,
  ).all();
}

/** Team commit from Monday snapshots, then where it stands right now. */
function commitTrend(quarter: string, team: Dashboard["team"]): TrendPoint[] {
  let weeks = sql<{ weekOf: string; forecastCommit: number; calledCommit: number | null }>(
    `select weekOf::text as weekOf,
            sum(closedAmount + commitAmount)::int as forecastCommit,
            sum(callCommit)::int as calledCommit
       from snapshots
      where quarter = ${quarter}::date
      group by weekOf
      order by weekOf`,
  ).all();

  let points: TrendPoint[] = weeks.map((w) => ({
    label: w.weekOf,
    forecastCommit: w.forecastCommit,
    calledCommit: w.calledCommit,
  }));

  if (quarter === activeQuarter()) {
    points.push({
      label: "now",
      forecastCommit: team.closed + team.commit,
      calledCommit: team.calls ? team.callCommit : null,
    });
  }

  return points;
}

export function loadDashboard(requested?: string): Dashboard {
  let quarter = requested ?? activeQuarter();

  if (!/^\d{4}-(01|04|07|10)-01$/.test(quarter)) {
    throw new ValidationError("unknown quarter");
  }

  let quarters = sql<{ quarter: string }>(
    `select quarter::text as quarter from quotas
      union
     select quarter::text from snapshots
      order by quarter desc`,
  ).all().map((q) => q.quarter);

  let reps = repNumbers(quarter);
  let team = teamTotals(reps);

  return {
    quarter,
    quarters: quarters.includes(quarter) ? quarters : [quarter, ...quarters],
    team,
    reps,
    weeks: weeklyClosed(quarter),
    trend: commitTrend(quarter, team),
  };
}

/** @rpc */
export function fetchDashboard(quarter: string): Dashboard {
  currentUserOrThrow("manager");
  return loadDashboard(quarter);
}
