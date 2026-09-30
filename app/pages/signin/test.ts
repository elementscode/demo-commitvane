import { test, equal, assert, session } from "@elements/app";
import { signin } from "#app/shared/services/auth";
import { seedTeam, thrown } from "#app/shared/test-fixtures";

test("signin", () => {
  let f = seedTeam();

  test("returns the role and logs in", () => {
    equal(signin(`  ${f.managerEmail.toUpperCase()} `, "forecast"), "manager");
    assert(session.isLoggedIn());
    equal(session.get("role"), "manager");
  });

  test("rejects a wrong password", async () => {
    equal(await thrown(() => signin(f.repEmail, "nope")), "AuthError");
    assert(!session.isLoggedIn());
  });
});
