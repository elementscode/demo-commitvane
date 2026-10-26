![Sales forecasts with live pipeline charts, built by Claude Code on Elements: the manager dashboard with quota, closed won, commit, best case, pipeline and weighted tiles, closed won against quota by week, and the team commit week over week against the called commit.](https://elements.dev/demos/01a0f3a0-0fbf-7be6-a019-a2b92ce0ed93/poster?v=48a3915ffb40)

# Sales forecasts with live pipeline charts, built by Claude Code on Elements

> Commitvane is a full-stack app built with Claude Code on Elements.

Reps update deals and submit weekly calls. Managers track commit, best case and weighted pipeline against quota in live charts.

[Run this app on your machine](https://elements.dev/demos/01a0f3a0-0fbf-7be6-a019-a2b92ce0ed93). Use this demo as inspiration, or as the starting point for your own app. Your agent creates a new app with this one as the scaffold, and you prompt it to add whatever features you want.

## How it's built

Commitvane needed rep and manager accounts, a dashboard that moves as reps edit deals and submit calls, charts drawn from live numbers, and a weekly snapshot job. Each of those is a part of Elements, so the agent spent its 17 minutes on the forecast math itself.

- **A live manager dashboard.** Deal edits and weekly calls notify a channel, and the manager's dashboard re-reads its numbers, so tiles, the call-versus-deals table and charts update within a second of a rep's change.

- **Charts that redraw.** Each chart mounts when its canvas appears on the page and redraws when the numbers change. The charting package came in with `elements install`.

- **Edits as function calls.** Reps update deals and submit weekly calls, and managers set quotas and stage probabilities, through `@rpc` functions called straight from the page. Marking a deal closed moves it to closed won in the same update.

- **A weekly snapshot job.** A one-line cron schedule runs a job every Monday at 7am that records each rep's numbers for the week, so the week-over-week chart has history.

- **Forecast math in SQL.** One query sums closed, commit, best case and pipeline per rep and weights each deal by its stage probability. Reps and managers each sign in to their own pages.

- **Data from SQL files.** Migrations define the schema and seed two managers, eight reps with quotas, sixty deals, and eight weeks of snapshots and calls. The project server applied each one as soon as it was saved.

## Why Elements

Elements is an integrated full-stack app framework and a project server. The project server checks the agent's work as it builds: it type-checks the server and browser code, analyzes the program, applies migrations and runs the tests, then reports the results to the agent. A security mistake, such as calling a server-only function from the browser, is a compile error. The agent reads the report and fixes its own mistakes before it tells you a feature is done. The same checks run on every feature you ask for next.
