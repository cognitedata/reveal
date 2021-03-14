import React from 'react';
import { Button, toast } from '@cognite/cogs.js';
import { Chart } from 'reducers/charts/types';
import { useCallFunction } from 'utils/cogniteFunctions';
import { getStepsFromWorkflow } from 'utils/transforms';
import { calculateGranularity } from 'utils/timeseries';

type Props = {
  chart: Chart;
  update: (c: Chart) => void;
};
export default function RunWorkflows({ chart, update }: Props) {
  const { mutate: callFunction } = useCallFunction('simple_calc-master');

  const handleRun = () => {
    chart.workflowCollection?.map((wf) => {
      const steps = getStepsFromWorkflow(wf);

      if (!steps.length) {
        return;
      }

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

      callFunction(
        { data: { computation_graph: computation } },
        {
          onSuccess({ functionId, callId }) {
            update({
              ...chart,
              workflowCollection: chart.workflowCollection?.map((w) =>
                w.id === wf.id
                  ? {
                      ...w,
                      calls: [
                        {
                          callDate: Date.now(),
                          functionId,
                          callId,
                        },
                      ],
                    }
                  : w
              ),
            });
          },
          onError() {
            toast.warn('Could not execute workflow');
          },
        }
      );
    });
  };

  return (
    <Button type="secondary" onClick={handleRun}>
      Run workflows
    </Button>
  );
}
