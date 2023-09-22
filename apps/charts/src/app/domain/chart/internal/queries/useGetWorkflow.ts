import { useMemo } from 'react';

import { useChartAtom } from '@charts-app/models/chart/atom';

import { ChartWorkflow } from '@cognite/charts-lib';

import { getWorkflow } from '../transformers/getWorkflow';

export const useGetWorkflow = (workflowId: string) => {
  const [chart] = useChartAtom();
  return useMemo<ChartWorkflow | undefined>(
    () => getWorkflow(chart!, workflowId),
    [chart, workflowId]
  );
};
