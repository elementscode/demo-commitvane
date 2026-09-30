import { Request, Response, redirect, session } from "@elements/app";
import { homeFor } from "#app/shared/services/auth";

export default function route(req: Request, res: Response) {
  let role = session.get("role");

  redirect(session.isLoggedIn() && role ? homeFor(role) : "/signin");
}
