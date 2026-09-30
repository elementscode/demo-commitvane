import { sql, session } from "@elements/app";
import type { Category } from "#app/shared/services/forecast";

export interface Fixture {
  managerId: string;
  managerEmail: string;
  repId: string;
  repEmail: string;
  otherRepId: string;
  quarter: string;
  dealId: string;
  otherDealId: string;
}

function user(email: string, name: string, role: "rep" | "manager"): string {
  return sql<{ id: string }>(
    `insert into users (email, name, role, passwordHash)
          values (${email}, ${name}, ${role}::userRole, crypt('forecast', genSalt('bf', 4)))
       returning id`,
  ).firstOrThrow().id;
}

export function deal(repId: string, amount: number, stage: string, category: Category, day = 30): string {
  return sql<{ id: string }>(
    `insert into deals (repId, account, name, amount, stageId, closeDate, category)
          select ${repId}, 'Acme', 'Expansion', ${amount}, id,
                 date_trunc('quarter', current_date)::date + ${day}::int, ${category}::forecastCategory
            from stages where name = ${stage}
       returning id`,
  ).firstOrThrow().id;
}

/** One manager, two reps with quotas, one deal each, in the current quarter. */
export function seedTeam(): Fixture {
  // Emails are unique and test files run at once, so each team gets its own.
  let suffix = crypto.randomUUID().slice(0, 8);
  let managerEmail = `boss.${suffix}@test.dev`;
  let repEmail = `ada.${suffix}@test.dev`;
  let managerId = user(managerEmail, "Boss", "manager");
  let repId = user(repEmail, "Ada Rep", "rep");
  let otherRepId = user(`bo.${suffix}@test.dev`, "Bo Rep", "rep");
  let quarter = sql<{ q: string }>(`select date_trunc('quarter', current_date)::date::text as q`).firstOrThrow().q;

  sql(`insert into quotas (repId, quarter, amount) values (${repId}, ${quarter}::date, 100000), (${otherRepId}, ${quarter}::date, 200000)`);

  return {
    managerId,
    managerEmail,
    repId,
    repEmail,
    otherRepId,
    quarter,
    dealId: deal(repId, 50000, "Proposal", "commit"),
    otherDealId: deal(otherRepId, 80000, "Discovery", "bestCase"),
  };
}

export function loginAs(id: string, role: "rep" | "manager") {
  session.login({ userId: id, userName: "test", role });
}

/**
 * Runs fn and returns the error's class name, or "" when it did not throw.
 * Async, so callers write `await thrown(...)` in an async test.
 */
export async function thrown(fn: () => unknown): Promise<string> {
  try {
    await fn();
    return "";
  } catch (err: any) {
    return err?.constructor?.name ?? "Error";
  }
}
