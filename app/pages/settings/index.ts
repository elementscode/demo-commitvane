import { Request, Response, redirect, session } from "@elements/app";
import { currentUserOrThrow } from "#app/shared/services/auth";
import { loadSettings } from "./services";
import settings from "./template";

export default function route(req: Request, res: Response) {
  if (session.get("role") === "rep") {
    redirect("/deals");
    return;
  }

  let manager = currentUserOrThrow("manager");

  return new settings({ name: manager.name, initial: loadSettings() });
}
