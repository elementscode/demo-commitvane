import { Request, Response, redirect, session } from "@elements/app";
import { currentUserOrThrow } from "#app/shared/services/auth";
import { loadForecast } from "./services";
import deals from "./template";

export default function route(req: Request, res: Response) {
  if (session.get("role") === "manager") {
    redirect("/dashboard");
    return;
  }

  let rep = currentUserOrThrow("rep");

  return new deals({ name: rep.name, initial: loadForecast(rep.id) });
}
