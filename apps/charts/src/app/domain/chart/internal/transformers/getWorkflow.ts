import { Chart, ChartWorkflow } from '@charts-app/models/chart/types';

export const getWorkflow = (
  chart: Chart,
  workflowId: string
): ChartWorkflow | undefined => {
  return chart.workflowCollection?.find(
    (workflow) => workflow.id === workflowId
  );
};
