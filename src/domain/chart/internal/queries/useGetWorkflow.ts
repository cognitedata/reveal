import { useChartAtom } from 'models/chart/atom';
import { useMemo } from 'react';
import { ChartWorkflow } from 'models/chart/types';
import { getWorkflow } from '../transformers/getWorkflow';

export const useGetWorkflow = (workflowId: string) => {
  const [chart] = useChartAtom();
  return useMemo<ChartWorkflow | undefined>(
    () => getWorkflow(chart!, workflowId),
    [chart, workflowId]
  );
};
