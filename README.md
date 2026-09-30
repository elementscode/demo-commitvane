![Commitvane, a sales forecasting app built with Elements: the manager dashboard with quota, closed won, commit, best case, pipeline and weighted tiles, closed won against quota by week, and the team commit week over week against the called commit.](https://elements.dev/demos/01a0f3a0-0fbf-7be6-a019-a2b92ce0ed93/poster?v=48a3915ffb40)

# Commitvane

> A demo app built with [Elements](https://elements.dev).

Reps update deals and submit weekly calls. Managers track commit, best case and weighted pipeline against quota in live charts.

**Demo:** [Commitvane](https://elements.dev/demos/01a0f3a0-0fbf-7be6-a019-a2b92ce0ed93)

## Agent specs

What one run of the prompt below took, from an empty Elements project to this
app.

- **Agent:** Claude Code, Opus 5.5 Medium
- **Time:** 17 min
- **Cost:** $6.05 at API rates, September 2026

## Get started

```bash
elements create commitvane -scaffold=elementscode/demo-commitvane
```

## Demo accounts

The seed creates two managers and eight reps with quotas for the current
quarter ($2.44M for the team), sixty deals across every stage and forecast
category, and eight weeks of Monday snapshots and weekly calls. Samuel and Theo
have not called this week, so the dashboard shows 6 of 8. Every account's
password is `forecast`, and the sign-in page lists them.

| Email                           | Role    |
| ------------------------------- | ------- |
| dana.whitfield@commitvane.test  | manager |
| marcus.chen@commitvane.test     | manager |
| priya.raman@commitvane.test     | rep     |
| jordan.ellis@commitvane.test    | rep     |
| mateo.alvarez@commitvane.test   | rep     |
| hannah.brooks@commitvane.test   | rep     |
| samuel.okafor@commitvane.test   | rep     |
| grace.lindqvist@commitvane.test | rep     |
| theo.nakamura@commitvane.test   | rep     |
| aisha.patel@commitvane.test     | rep     |

Managers land on `/dashboard` (tiles, charts, calls against deals, per-rep
numbers) and set quotas and stage probabilities at `/settings`. Reps land on
`/deals`, where they edit deals and submit their weekly call.

## The prompt

```text
Build a sales forecasting tool named commitvane for a sales team of eight reps and
two managers.

REP
- Log in, see their open deals: account, amount, stage, close date,
  forecast category (pipeline, best case, commit, closed).
- Update a deal's amount, close date or category.
- Submit a weekly call: their commit and best-case numbers for the quarter.

MANAGER
- Quarter dashboard: quota, closed won, commit, best case, pipeline, and a
  weighted forecast (amount x stage probability), for the team and per rep.
- Charts: closed won against quota by week (line), forecast by category per
  rep (stacked bar), and how the team's commit has moved week over week.
- A table of every rep's call next to what their deals add up to, with the gap
  highlighted.
- Set quotas per rep per quarter and stage probabilities.

Every Monday at 7am, snapshot each rep's numbers so the week-over-week chart
has history.

Use Chart.js for the charts.

Seed two managers, eight reps with quotas, sixty deals across stages and
categories this quarter, and eight weeks of snapshots. Show the seeded logins
on the sign-in page.

Deal edits and submitted calls update the manager dashboard in real time.
```

## License

MIT. See [LICENSE](LICENSE).
