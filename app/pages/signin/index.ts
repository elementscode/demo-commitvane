import { Request, Response, redirect, session, sql } from "@elements/app";
import config from "#config";
import { homeFor } from "#app/shared/services/auth";
import signin, { DemoLogin } from "./template";

export default function route(req: Request, res: Response) {
  let role = session.get("role");

  if (session.isLoggedIn() && role) {
    redirect(homeFor(role));
    return;
  }

  let logins: DemoLogin[] = [];

  if (config.demo.showLogins) {
    logins = sql<DemoLogin>(
      `select id, name, email, role from users order by role desc, name`,
    ).all();
  }

  return new signin({ logins });
}
