import { Channel, sql } from "@elements/app";

export type Category = "pipeline" | "bestCase" | "commit" | "closed";

export interface ForecastChange {
  repId: string;
  kind: "deal" | "call" | "quota" | "stage" | "snapshot";
}

/**
 * Deal edits, calls, quotas and stage probabilities all notify it; the
 * manager dashboard re-reads its numbers on each message.
 */
export const forecastChannel = new Channel<ForecastChange>("forecast");

export interface RepNumbers {
  repId: string;
  name: string;
  quota: number;
  closed: number;
  commit: number;
  bestCase: number;
  pipeline: number;
  weighted: number;
  callCommit: number | null;
  callBestCase: number | null;
  calledAt: Date | null;
  calledThisWeek: boolean;
}

/**
 * The quarter the team is working: the latest one with quotas that has
 * started, so the forecast stays on it until a manager sets the next one.
 */
export function activeQuarter(): string {
  return sql<{ quarter: string }>(
    `select coalesce(
       (select max(quarter) from quotas where quarter <= current_date),
       date_trunc('quarter', current_date)::date
     )::text as quarter`,
  ).firstOrThrow().quarter;
}

/**
 * Each rep's numbers for a quarter, per category. A deal counts toward the
 * quarter its close date falls in; weighted uses the stage probability, and a
 * closed deal counts in full.
 */
export function repNumbers(quarter: string, repId: string | null = null): RepNumbers[] {
  return sql<RepNumbers>(
    `select u.id as repId,
            u.name,
            coalesce(q.amount, 0) as quota,
            coalesce(sum(d.amount) filter (where d.category = 'closed'), 0)::int as closed,
            coalesce(sum(d.amount) filter (where d.category = 'commit'), 0)::int as commit,
            coalesce(sum(d.amount) filter (where d.category = 'bestCase'), 0)::int as bestCase,
            coalesce(sum(d.amount) filter (where d.category = 'pipeline'), 0)::int as pipeline,
            coalesce(round(sum(d.amount * case when d.category = 'closed' then 100 else s.probability end / 100.0)), 0)::int as weighted,
            c.commitAmount as callCommit,
            c.bestCaseAmount as callBestCase,
            c.createdAt as calledAt,
            coalesce(c.createdAt >= date_trunc('week', now()), false) as calledThisWeek
       from users u
       left join quotas q on q.repId = u.id and q.quarter = ${quarter}::date
       left join deals d on d.repId = u.id
                        and d.closeDate >= ${quarter}::date
                        and d.closeDate < ${quarter}::date + interval '3 months'
       left join stages s on s.id = d.stageId
       left join lateral (
             select commitAmount, bestCaseAmount, createdAt
               from calls
              where calls.repId = u.id and calls.quarter = ${quarter}::date
              order by createdAt desc, id desc
              limit 1
       ) c on true
      where u.role = 'rep'
        and (${repId}::uuid is null or u.id = ${repId}::uuid)
      group by u.id, u.name, q.amount, c.commitAmount, c.bestCaseAmount, c.createdAt
      order by u.name`,
  ).all();
}
