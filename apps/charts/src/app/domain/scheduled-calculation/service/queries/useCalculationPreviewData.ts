/**
 * Get calc datapoints for Scheduled Calc prevew
 */
import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { CalculationResultQueryAggregateEnum } from '@cognite/calculation-backend';
import { useSDK } from '@cognite/sdk-provider';

import { WorkflowState } from '../../../../models/calculation-results/types';
import { fetchCalculationQueryResult } from '../../../../services/calculation-backend';
import { calculateGranularity } from '../../../../utils/timeseries';
import { useGetWorkflow } from '../../../chart/internal/queries/useGetWorkflow';

const POINTS_PER_SERIES_IN_PREVIEW = 100;

export const useCalculationPreviewData = (
  workflowId: string,
  dateFrom: string,
  dateTo: string
) => {
  const sdk = useSDK();
  const workflow = useGetWorkflow(workflowId);

  const hasValidDates = dayjs(dateTo).valueOf() - dayjs(dateFrom).valueOf() > 0;

  const callId = workflow?.calls?.[0]?.callId;

  const calculationResultQuery = useMemo(() => {
    return {
      items: [],
      start: dayjs(dateFrom).toDate().getTime(),
      end: dayjs(dateTo).toDate().getTime(),
      granularity: calculateGranularity(
        [dayjs(dateFrom).valueOf(), dayjs(dateTo).valueOf()],
        POINTS_PER_SERIES_IN_PREVIEW
      ),
      aggregates: ['average'] as CalculationResultQueryAggregateEnum[],
      limit: POINTS_PER_SERIES_IN_PREVIEW,
    };
  }, [dateFrom, dateTo]);

  /**
   * Load data to preview (workflow)
   */
  return useQuery(
    ['chart-data', 'calculation', calculationResultQuery],
    async () => {
      const result = await fetchCalculationQueryResult(
        sdk,
        String(callId),
        calculationResultQuery
      );

      return { ...result, id: workflow?.id } as WorkflowState;
    },
    {
      enabled: hasValidDates && !!workflow && !!callId,
    }
  );
};
