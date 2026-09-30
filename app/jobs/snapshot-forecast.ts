import { Job, sql, tx } from "@elements/app";
import { activeQuarter, repNumbers, forecastChannel } from "#app/shared/services/forecast";

export interface SnapshotForecastJobFields {}

/**
 * Records each rep's numbers for the active quarter under this week's
 * Monday. Running it twice in a week replaces that week's row, so a retry
 * never doubles a point on the week-over-week chart.
 */
export class SnapshotForecastJob extends Job<SnapshotForecastJobFields> {
  run() {
    let quarter = activeQuarter();
    let reps = repNumbers(quarter);

    tx(() => {
      for (let r of reps) {
        sql(
          `insert into snapshots (repId, quarter, weekOf, quota, closedAmount, commitAmount,
                                  bestCaseAmount, pipelineAmount, weightedAmount, callCommit,
                                  callBestCase)
                values (${r.repId}, ${quarter}::date, date_trunc('week', current_date)::date, ${r.quota},
                        ${r.closed}, ${r.commit}, ${r.bestCase}, ${r.pipeline}, ${r.weighted},
                        ${r.callCommit}, ${r.callBestCase})
           on conflict (repId, weekOf) do update
                set quarter = excluded.quarter,
                    quota = excluded.quota,
                    closedAmount = excluded.closedAmount,
                    commitAmount = excluded.commitAmount,
                    bestCaseAmount = excluded.bestCaseAmount,
                    pipelineAmount = excluded.pipelineAmount,
                    weightedAmount = excluded.weightedAmount,
                    callCommit = excluded.callCommit,
                    callBestCase = excluded.callBestCase`,
        );
      }
    });

    forecastChannel.notify({ repId: "", kind: "snapshot" });
  }
}
