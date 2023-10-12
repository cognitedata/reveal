import { useMemo } from 'react';

import { ChartWorkflow } from '@cognite/charts-lib';

import { useChartAtom } from '../../../../models/chart/atom';
import { getWorkflow } from '../transformers/getWorkflow';

export const useGetWorkflow = (workflowId: string) => {
  const [chart] = useChartAtom();
  return useMemo<ChartWorkflow | undefined>(
    () => getWorkflow(chart!, workflowId),
    [chart, workflowId]
  );
};
