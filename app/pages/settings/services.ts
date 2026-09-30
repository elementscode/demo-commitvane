import { sql, ValidationError, NotFoundError } from "@elements/app";
import { currentUserOrThrow } from "#app/shared/services/auth";
import { activeQuarter, forecastChannel } from "#app/shared/services/forecast";

export interface QuotaRow {
  id: string;
  repId: string;
  name: string;
  amount: number;
  saved?: boolean;
  error?: string;
}

export interface StageRow {
  id: string;
  name: string;
  probability: number;
  saved?: boolean;
  error?: string;
}

export interface Settings {
  quarter: string;
  quarters: string[];
  quotas: QuotaRow[];
  stages: StageRow[];
}

function isQuarter(q: string): boolean {
  return /^\d{4}-(01|04|07|10)-01$/.test(q);
}

/** The active quarter and the two after it, so next quarter's quotas can go in early. */
function quarterChoices(active: string): string[] {
  return sql<{ quarter: string }>(
    `select (${active}::date + (n * interval '3 months'))::date::text as quarter
       from generate_series(0, 2) n`,
  ).all().map((r) => r.quarter);
}

export function loadSettings(requested?: string): Settings {
  let active = activeQuarter();
  let quarter = requested ?? active;

  if (!isQuarter(quarter)) {
    throw new ValidationError("unknown quarter");
  }

  let quotas = sql<QuotaRow>(
    `select u.id as id, u.id as repId, u.name, coalesce(q.amount, 0) as amount
       from users u
       left join quotas q on q.repId = u.id and q.quarter = ${quarter}::date
      where u.role = 'rep'
      order by u.name`,
  ).all();

  let stages = sql<StageRow>(`select id, name, probability from stages order by position`).all();

  return { quarter, quarters: quarterChoices(active), quotas, stages };
}

/** @rpc */
export function fetchSettings(quarter: string): Settings {
  currentUserOrThrow("manager");
  return loadSettings(quarter);
}

function wholeNumber(value: number | string, label: string): number {
  let n = typeof value === "number" ? value : Number(String(value).replace(/[$,\s]/g, ""));

  if (!Number.isFinite(n) || n < 0) {
    throw new ValidationError(`${label} must be zero or more`);
  }

  return Math.round(n);
}

/** @rpc */
export function setQuota(repId: string, quarter: string, amount: number | string) {
  currentUserOrThrow("manager");

  if (!isQuarter(quarter)) {
    throw new ValidationError("unknown quarter");
  }

  let dollars = wholeNumber(amount, "quota");

  let rep = sql(`select 1 from users where id = ${repId} and role = 'rep'`).first();

  if (!rep) {
    throw new NotFoundError("rep not found");
  }

  sql(
    `insert into quotas (repId, quarter, amount)
          values (${repId}, ${quarter}::date, ${dollars})
     on conflict (repId, quarter) do update set amount = excluded.amount`,
  );

  forecastChannel.notify({ repId, kind: "quota" });
}

/** @rpc */
export function setProbability(stageId: string, probability: number | string) {
  currentUserOrThrow("manager");

  let pct = wholeNumber(probability, "probability");

  if (pct > 100) {
    throw new ValidationError("probability can't be over 100%");
  }

  let updated = sql(`update stages set probability = ${pct} where id = ${stageId} returning id`).first();

  if (!updated) {
    throw new NotFoundError("stage not found");
  }

  forecastChannel.notify({ repId: "", kind: "stage" });
}
