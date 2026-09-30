import { sql, ValidationError, NotFoundError } from "@elements/app";
import { currentUserOrThrow } from "#app/shared/services/auth";
import { activeQuarter, repNumbers, forecastChannel, RepNumbers, Category } from "#app/shared/services/forecast";

export interface Deal {
  id: string;
  account: string;
  name: string;
  amount: number;
  stage: string;
  probability: number;
  closeDate: string;
  category: Category;
}

export interface CallForm {
  commit: number;
  bestCase: number;
}

export interface RepForecast {
  quarter: string;
  quarterEnd: string;
  numbers: RepNumbers;
  open: Deal[];
  closed: Deal[];
}

const CATEGORY_VALUES: Category[] = ["pipeline", "bestCase", "commit", "closed"];

function dealsFor(repId: string, where: string, quarter: string): Deal[] {
  return sql<Deal>(
    `select d.id, d.account, d.name, d.amount, s.name as stage, s.probability,
            d.closeDate::text as closeDate, d.category
       from deals d
       join stages s on s.id = d.stageId
      where d.repId = ${repId}
        and (${where} = 'open' and d.category <> 'closed'
             or ${where} = 'closed' and d.category = 'closed'
                and d.closeDate >= ${quarter}::date
                and d.closeDate < ${quarter}::date + interval '3 months')
      order by d.closeDate, d.amount desc`,
  ).all();
}

export function loadForecast(repId: string): RepForecast {
  let quarter = activeQuarter();
  let [numbers] = repNumbers(quarter, repId);

  let { quarterEnd } = sql<{ quarterEnd: string }>(
    `select (${quarter}::date + interval '3 months' - interval '1 day')::date::text as quarterEnd`,
  ).firstOrThrow();

  return {
    quarter,
    quarterEnd,
    numbers,
    open: dealsFor(repId, "open", quarter),
    closed: dealsFor(repId, "closed", quarter),
  };
}

/** @rpc */
export function fetchForecast(): RepForecast {
  let rep = currentUserOrThrow("rep");
  return loadForecast(rep.id);
}

function wholeDollars(value: number | string, label: string): number {
  let n = typeof value === "number" ? value : Number(String(value).replace(/[$,\s]/g, ""));

  if (!Number.isFinite(n) || n < 0) {
    throw new ValidationError(`${label} must be a positive amount`);
  }

  return Math.round(n);
}

/**
 * A deal marked closed moves to the closed won stage, and one reopened from
 * closed goes back to negotiation, so weighted forecast follows the category.
 * @rpc
 */
export function updateDeal(id: string, amount: number | string, closeDate: string, category: Category): RepForecast {
  let rep = currentUserOrThrow("rep");
  let dollars = wholeDollars(amount, "amount");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(closeDate) || Number.isNaN(Date.parse(closeDate))) {
    throw new ValidationError("close date must be a date");
  }

  if (!CATEGORY_VALUES.includes(category)) {
    throw new ValidationError("pick a forecast category");
  }

  let updated = sql(
    `update deals d
        set amount = ${dollars},
            closeDate = ${closeDate}::date,
            category = ${category}::forecastCategory,
            stageId = case
              when ${category} = 'closed' then (select id from stages where probability = 100 order by position desc limit 1)
              when d.category = 'closed' then (select id from stages where probability < 100 order by position desc limit 1)
              else d.stageId
            end
      where d.id = ${id} and d.repId = ${rep.id}
      returning d.id`,
  ).first();

  if (!updated) {
    throw new NotFoundError("deal not found");
  }

  forecastChannel.notify({ repId: rep.id, kind: "deal" });

  return loadForecast(rep.id);
}

/** @rpc */
export function submitCall(form: CallForm): RepForecast {
  let rep = currentUserOrThrow("rep");
  let commit = wholeDollars(form.commit, "commit");
  let bestCase = wholeDollars(form.bestCase, "best case");

  if (bestCase < commit) {
    throw new ValidationError("best case can't be below commit");
  }

  let quarter = activeQuarter();

  sql(
    `insert into calls (repId, quarter, commitAmount, bestCaseAmount)
          values (${rep.id}, ${quarter}::date, ${commit}, ${bestCase})`,
  );

  forecastChannel.notify({ repId: rep.id, kind: "call" });

  return loadForecast(rep.id);
}
