import { test, equal, assert, sql } from "@elements/app";
import { seedTeam, loginAs, thrown } from "#app/shared/test-fixtures";
import { updateDeal, submitCall, fetchForecast } from "./services";

test("deals", () => {
  let f = seedTeam();

  test("a rep sees only their own deals", () => {
    loginAs(f.repId, "rep");
    let forecast = fetchForecast();

    equal(forecast.open.map((d) => d.id), [f.dealId]);
    equal(forecast.numbers.commit, 50000);
    equal(forecast.numbers.weighted, 30000);
  });

  test("closing a deal moves it to closed won", () => {
    loginAs(f.repId, "rep");
    let closeDate = sql<{ d: string }>(`select closeDate::text as d from deals where id = ${f.dealId}`).firstOrThrow().d;
    let forecast = updateDeal(f.dealId, "55,000", closeDate, "closed");

    equal(forecast.open.length, 0);
    equal(forecast.closed[0].stage, "Closed won");
    equal(forecast.numbers.closed, 55000);
  });

  test("reopening a closed deal leaves closed won", () => {
    loginAs(f.repId, "rep");
    let closeDate = sql<{ d: string }>(`select closeDate::text as d from deals where id = ${f.dealId}`).firstOrThrow().d;
    updateDeal(f.dealId, 50000, closeDate, "closed");
    let forecast = updateDeal(f.dealId, 50000, closeDate, "commit");

    assert(forecast.open[0].stage !== "Closed won");
  });

  test("a rep cannot edit another rep's deal", async () => {
    loginAs(f.repId, "rep");
    equal(await thrown(() => updateDeal(f.otherDealId, 1, "2026-09-30", "closed")), "NotFoundError");
  });

  test("bad input is rejected", async () => {
    loginAs(f.repId, "rep");
    equal(await thrown(() => updateDeal(f.dealId, -5, "2026-09-30", "commit")), "ValidationError");
    equal(await thrown(() => updateDeal(f.dealId, 5, "soon", "commit")), "ValidationError");
    equal(await thrown(() => updateDeal(f.dealId, 5, "2026-09-30", "maybe" as any)), "ValidationError");
  });

  test("a manager cannot use the rep rpc", async () => {
    loginAs(f.managerId, "manager");
    equal(await thrown(() => fetchForecast()), "ForbiddenError");
  });

  test("the latest call is the call", () => {
    loginAs(f.repId, "rep");
    submitCall({ commit: 40000, bestCase: 60000 });
    let forecast = submitCall({ commit: 45000, bestCase: 70000 });

    equal(forecast.numbers.callCommit, 45000);
    equal(forecast.numbers.callBestCase, 70000);
    equal(forecast.numbers.calledThisWeek, true);
  });

  test("best case below commit is rejected", async () => {
    loginAs(f.repId, "rep");
    equal(await thrown(() => submitCall({ commit: 50000, bestCase: 10000 })), "ValidationError");
  });
});
