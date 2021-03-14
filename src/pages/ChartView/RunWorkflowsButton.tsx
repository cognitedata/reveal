import React from 'react';
import { Button } from '@cognite/cogs.js';
import { Chart, Call } from 'reducers/charts/types';
import { useCallFunction } from 'utils/cogniteFunctions';
import { getStepsFromWorkflow } from 'utils/transforms';
import { calculateGranularity } from 'utils/timeseries';

type Props = {
  chart: Chart;
  update: (c: Chart) => void;
};
export default function RunWorkflows({ chart, update }: Props) {
  const { mutateAsync: callFunction } = useCallFunction('simple_calc-master');

  const handleRun = () => {
    const updates = chart.workflowCollection
      ?.filter((wf) => getStepsFromWorkflow(wf).length > 0)
      .map(async (wf) => {
        const steps = getStepsFromWorkflow(wf);

        const computation = {
          steps,
          start_time: new Date(chart.dateFrom).getTime(),
          end_time: new Date(chart.dateTo).getTime(),
          granularity: calculateGranularity(
            [
              new Date(chart.dateFrom).getTime(),
              new Date(chart.dateTo).getTime(),
            ],
            1000
          ),
        };

        const call = await callFunction({
          data: { computation_graph: computation },
        });
        return {
          ...call,
          callDate: Date.now(),
          id: wf.id,
        };
      });
    if (updates) {
      Promise.all(updates).then((r) => {
        const calls: Record<string, Call> = r.reduce(
          (accl, c) => ({ ...accl, [c.id]: c }),
          {}
        );
        update({
          ...chart,
          workflowCollection: chart?.workflowCollection?.map((w) => {
            return calls[w.id]
              ? {
                  ...w,
                  calls: [calls[w.id]],
                }
              : w;
          }),
        });
      });
    }
  };

  return (
    <Button type="secondary" onClick={handleRun}>
      Run workflows
    </Button>
  );
}
