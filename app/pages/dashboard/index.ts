import { Request, Response, redirect, session } from "@elements/app";
import { currentUserOrThrow } from "#app/shared/services/auth";
import { forecastChannel } from "#app/shared/services/forecast";
import { loadDashboard } from "./services";
import dashboard from "./template";

export default function route(req: Request, res: Response) {
  if (session.get("role") === "rep") {
    redirect("/deals");
    return;
  }

  let manager = currentUserOrThrow("manager");

  return new dashboard({
    name: manager.name,
    initial: loadDashboard(),
    changes: forecastChannel.listen(),
  });
}
