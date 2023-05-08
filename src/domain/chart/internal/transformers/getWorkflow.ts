import { Chart, ChartWorkflow } from 'models/chart/types';

export const getWorkflow = (
  chart: Chart,
  workflowId: string
): ChartWorkflow | undefined => {
  return chart.workflowCollection?.find(
    (workflow) => workflow.id === workflowId
  );
};
