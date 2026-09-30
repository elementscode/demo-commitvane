import { App } from "@elements/app";
import config from "#config";
import home from "#app/pages/home";
import signin from "#app/pages/signin";
import deals from "#app/pages/deals";
import dashboard from "#app/pages/dashboard";
import settings from "#app/pages/settings";
import { SnapshotForecastJob } from "#app/jobs/snapshot-forecast";
import notFound from "#app/pages/errors/not-found";
import unhandled from "#app/pages/errors/unhandled";

const app = new App();

app.route("/", home);
app.route("/signin", signin);
app.route("/deals", deals);
app.route("/dashboard", dashboard);
app.route("/settings", settings);

app.cron("every monday at 7am", "snapshot forecast", () => new SnapshotForecastJob().schedule());

app.error((req, res, err) => {
  switch (err.statusCode) {
    case 401:
      return res.redirect("/signin");

    case 404:
      return notFound(req, res, err);

    default:
      return unhandled(req, res, err);
  }
});

app.start(config);
