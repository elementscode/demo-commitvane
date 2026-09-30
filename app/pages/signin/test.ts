import { test, equal, assert, session } from "@elements/app";
import { signin } from "#app/shared/services/auth";
import { seedTeam, thrown } from "#app/shared/test-fixtures";

test("signin", () => {
  seedTeam();

  test("returns the role and logs in", () => {
    equal(signin("  BOSS@test.dev ", "forecast"), "manager");
    assert(session.isLoggedIn());
    equal(session.get("role"), "manager");
  });

  test("rejects a wrong password", async () => {
    equal(await thrown(() => signin("ada@test.dev", "nope")), "AuthError");
    assert(!session.isLoggedIn());
  });
});
