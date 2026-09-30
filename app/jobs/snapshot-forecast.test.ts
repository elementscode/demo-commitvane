import { test, equal, sql } from "@elements/app";
import { seedTeam } from "#app/shared/test-fixtures";
import { SnapshotForecastJob } from "./snapshot-forecast";

test("snapshot forecast", () => {
  let f = seedTeam();

  test("one row per rep per week, even when run twice", () => {
    new SnapshotForecastJob().run();
    sql(`update deals set amount = 60000 where id = ${f.dealId}`);
    new SnapshotForecastJob().run();

    let rows = sql<{ repId: string; commitAmount: number; quota: number }>(
      `select repId, commitAmount, quota from snapshots
        where weekOf = date_trunc('week', current_date)::date
        order by quota`,
    ).all();

    equal(rows.length, 2);
    equal(rows[0].repId, f.repId);
    equal(rows[0].commitAmount, 60000);
  });
});
