import { test, equal } from "@elements/app";
import { seedTeam, loginAs, thrown, deal } from "#app/shared/test-fixtures";
import { fetchDashboard, loadDashboard } from "./services";

test("dashboard", () => {
  let f = seedTeam();
  deal(f.repId, 20000, "Closed won", "closed", 3);
  deal(f.otherRepId, 10000, "Prospecting", "pipeline");

  test("team totals add up the reps", () => {
    let d = loadDashboard();

    equal(d.quarter, f.quarter);
    equal(d.team.quota, 300000);
    equal(d.team.closed, 20000);
    equal(d.team.commit, 50000);
    equal(d.team.bestCase, 80000);
    equal(d.team.pipeline, 10000);
    // 20000 closed in full + 50000 at 60% + 80000 at 40% + 10000 at 10%
    equal(d.team.weighted, 20000 + 30000 + 32000 + 1000);
  });

  test("closed won accumulates by week", () => {
    let d = loadDashboard();
    let reached = d.weeks.filter((w) => w.closed !== null);

    equal(reached[reached.length - 1].closed, 20000);
    equal(d.weeks.length >= 13, true);
  });

  test("the trend ends at the live number", () => {
    let d = loadDashboard();
    let last = d.trend[d.trend.length - 1];

    equal(last.label, "now");
    equal(last.forecastCommit, 70000);
  });

  test("only managers can fetch it", async () => {
    loginAs(f.repId, "rep");
    equal(await thrown(() => fetchDashboard(f.quarter)), "ForbiddenError");

    loginAs(f.managerId, "manager");
    equal(await thrown(() => fetchDashboard("2026-02-01")), "ValidationError");
    equal(fetchDashboard(f.quarter).reps.length, 2);
  });
});
