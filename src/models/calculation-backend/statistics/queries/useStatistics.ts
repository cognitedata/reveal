import { useCallback, useEffect } from 'react';
import { Chart, ChartTimeSeries, ChartWorkflow } from 'models/chart/types';
import chartAtom from 'models/chart/atom';
import { useSDK } from '@cognite/sdk-provider';
import { useDebounce } from 'use-debounce';
import { useQuery } from 'react-query';
import {
  fetchStatisticsResult,
  waitForCalculationToFinish,
  waitForStatisticsToFinish,
} from 'services/calculation-backend';

import { useCreateStatistics } from 'hooks/calculation-backend';

import {
  CreateStatisticsParams,
  StatusStatusEnum,
} from '@cognite/calculation-backend';

import { getHash } from 'utils/hash';
import { usePrevious } from 'react-use';
import { useRecoilState } from 'recoil';

export default function useStatistics(
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined,
  dateFrom: string,
  dateTo: string,
  enabled: boolean = true
) {
  const sdk = useSDK();
  const statisticsCall = sourceItem?.statisticsCalls?.[0];
  const [, setChart] = useRecoilState(chartAtom);
  const sourceId = sourceItem?.id;
  const previousSourceId = usePrevious<string | undefined>(sourceId);
  const sourceChanged = sourceId !== previousSourceId;

  /**
   * Using strings to avoid custom equality check
   */
  const datesAsString = JSON.stringify({ dateFrom, dateTo });

  const [debouncedDatesAsString] = useDebounce(datesAsString, 3000);
  const debouncedPrevDatesAsString = usePrevious<string>(
    debouncedDatesAsString
  );

  const {
    data: callStatus,
    error: callStatusError,
    isFetching: isFetchingCallStatus,
    isLoading: isLoadingCallstatus,
  } = useQuery({
    queryKey: ['statistics', 'status', statisticsCall?.callId],
    queryFn: async () => {
      return waitForStatisticsToFinish(sdk, String(statisticsCall?.callId));
    },
    enabled: !!statisticsCall?.callId,
    refetchOnWindowFocus: false,
  });

  const { data: statisticsData } = useQuery({
    queryKey: ['statistics', 'result', statisticsCall?.callId],
    queryFn: () => fetchStatisticsResult(sdk, statisticsCall?.callId || ''),
    retry: true,
    retryDelay: 1000,
    enabled: callStatus?.status === StatusStatusEnum.Success,
    refetchOnWindowFocus: false,
  });

  const { results: statistics } = statisticsData || {};
  const { mutate: callFunction } = useCreateStatistics();
  const memoizedCallFunction = useCallback(callFunction, [callFunction]);

  const updateStatistics = useCallback(
    (diff: Partial<ChartTimeSeries | ChartWorkflow>) => {
      if (!sourceItem) return;
      setChart((oldChart) => {
        if (!oldChart) {
          return undefined;
        }

        return {
          ...oldChart,
          timeSeriesCollection: oldChart?.timeSeriesCollection?.map((ts) =>
            ts.id === sourceItem.id
              ? {
                  ...ts,
                  ...diff,
                }
              : ts
          ),
          workflowCollection: oldChart?.workflowCollection?.map((wf) =>
            wf.id === sourceItem.id
              ? {
                  ...wf,
                  ...diff,
                }
              : wf
          ),
        } as Chart;
      });
    },
    [setChart, sourceItem]
  );

  const datesChanged =
    debouncedPrevDatesAsString &&
    debouncedPrevDatesAsString !== debouncedDatesAsString;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!sourceItem) {
      return;
    }

    if (!sourceChanged && !datesChanged) {
      if (statistics) {
        return;
      }
      if (statisticsCall && !callStatusError) {
        return;
      }
    }

    let identifier;
    if (sourceItem.type === 'timeseries') {
      identifier = (sourceItem as ChartTimeSeries).tsExternalId;
    } else {
      const backendCalls = (sourceItem as ChartWorkflow).calls;
      if (backendCalls && backendCalls.length > 0) {
        identifier = backendCalls[0].callId;
      } else {
        return;
      }
    }

    if (!identifier) {
      return;
    }

    const statisticsParameters: CreateStatisticsParams = {
      start_time: new Date(dateFrom).getTime(),
      end_time: new Date(dateTo).getTime(),
      histogram_options: { num_boxes: 10 }, // (eiriklv): This should be chosen by user at some point
      ...(sourceItem.type === 'timeseries'
        ? { tag: identifier }
        : { calculation_id: identifier }),
    };

    const hashOfParams = getHash(statisticsParameters);

    if (hashOfParams === statisticsCall?.hash && !callStatusError) {
      return;
    }

    async function createStatistics() {
      if (
        'calculation_id' in statisticsParameters &&
        statisticsParameters.calculation_id
      ) {
        await waitForCalculationToFinish(
          sdk,
          statisticsParameters.calculation_id
        );
      }

      memoizedCallFunction(statisticsParameters, {
        onSuccess({ id: callId }) {
          updateStatistics({
            statisticsCalls: [
              {
                callDate: Date.now(),
                callId,
                hash: hashOfParams,
              },
            ],
          });
        },
      });
    }

    createStatistics();
  }, [
    sdk,
    memoizedCallFunction,
    dateFrom,
    dateTo,
    sourceItem,
    updateStatistics,
    statistics,
    statisticsCall,
    callStatus,
    callStatusError,
    datesChanged,
    sourceChanged,
    enabled,
  ]);

  const status =
    isFetchingCallStatus || isLoadingCallstatus
      ? StatusStatusEnum.Running
      : callStatus?.status;

  return {
    results: statisticsData?.results,
    error: callStatusError,
    loading: isFetchingCallStatus,
    status,
  };
}
