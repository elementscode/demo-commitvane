import { test, equal, sql } from "@elements/app";
import { seedTeam, loginAs, thrown } from "#app/shared/test-fixtures";
import { setQuota, setProbability, fetchSettings } from "./services";

test("settings", () => {
  let f = seedTeam();

  test("sets and replaces a quota", () => {
    loginAs(f.managerId, "manager");
    let next = fetchSettings(f.quarter).quarters[1];

    setQuota(f.repId, next, 120000);
    setQuota(f.repId, next, "125,000");

    let rows = sql<{ amount: number }>(`select amount from quotas where repId = ${f.repId} and quarter = ${next}::date`).all();
    equal(rows.map((r) => r.amount), [125000]);
    equal(fetchSettings(next).quotas.find((q) => q.repId === f.repId)?.amount, 125000);
  });

  test("probability must be 0 to 100", async () => {
    loginAs(f.managerId, "manager");
    let stage = fetchSettings(f.quarter).stages[0];

    equal(await thrown(() => setProbability(stage.id, 120)), "ValidationError");
    setProbability(stage.id, 15);
    equal(fetchSettings(f.quarter).stages[0].probability, 15);
  });

  test("reps cannot change settings", async () => {
    loginAs(f.repId, "rep");
    equal(await thrown(() => setQuota(f.repId, f.quarter, 1)), "ForbiddenError");
  });
});
