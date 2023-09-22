import { Chart, ChartWorkflow } from '@cognite/charts-lib';

export const getWorkflow = (
  chart: Chart,
  workflowId: string
): ChartWorkflow | undefined => {
  return chart.workflowCollection?.find(
    (workflow) => workflow.id === workflowId
  );
};
