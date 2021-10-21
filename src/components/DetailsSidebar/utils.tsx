/* eslint camelcase: 0 */
import { useCallback, useEffect } from 'react';
import { ChartTimeSeries, ChartWorkflow } from 'models/chart/types';
import { useSDK } from '@cognite/sdk-provider';
import { useRecoilState } from 'recoil';
import { chartAtom } from 'models/chart/atom';
import { useDebounce } from 'use-debounce';
import { useQuery } from 'react-query';
import { units } from 'utils/units';
import {
  fetchStatisticsResult,
  fetchStatisticsStatus,
} from 'services/calculation-backend';
import { useCreateStatistics } from 'hooks/calculation-backend';
import { CreateStatisticsParams } from '@cognite/calculation-backend';
import { getHash } from 'utils/hash';
import { useCluster, useProject } from 'hooks/config';
import { usePrevious } from 'react-use';

export const useFusionLink = (path: string) => {
  const [cluster] = useCluster();
  const project = useProject();

  return `https://fusion.cognite.com/${project}${path}${
    cluster && `?env=${cluster}`
  }`;
};

export const useStatistics = (
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined
) => {
  const sdk = useSDK();
  const statisticsCall = sourceItem?.statisticsCalls?.[0];
  const [chart, setChart] = useRecoilState(chartAtom);
  const { dateFrom, dateTo } = chart!;
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

  const { data: statisticsData } = useQuery({
    queryKey: ['statistics', 'result', statisticsCall?.callId],
    queryFn: () => fetchStatisticsResult(sdk, statisticsCall?.callId || ''),
    retry: 1,
    retryDelay: 1000,
    enabled: !!statisticsCall,
  });

  const { data: callStatus, error: callStatusError } = useQuery({
    queryKey: ['statistics', 'status', statisticsCall?.callId],
    queryFn: () => fetchStatisticsStatus(sdk, String(statisticsCall?.callId)),
    enabled: !!statisticsCall?.callId,
  });

  const { results: statistics } = statisticsData || {};
  const { mutate: callFunction } = useCreateStatistics();
  const memoizedCallFunction = useCallback(callFunction, [callFunction]);

  const updateStatistics = useCallback(
    (diff: Partial<ChartTimeSeries | ChartWorkflow>) => {
      if (!sourceItem) {
        return;
      }
      setChart((oldChart) => ({
        ...oldChart!,
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
      }));
    },
    [setChart, sourceItem]
  );

  const datesChanged =
    debouncedPrevDatesAsString &&
    debouncedPrevDatesAsString !== debouncedDatesAsString;

  useEffect(() => {
    if (!sourceChanged) {
      if (!datesChanged) {
        if (statistics) {
          return;
        }
        if (statisticsCall && !callStatusError) {
          return;
        }
      }
    }

    const statisticsParameters: CreateStatisticsParams = {
      start_time: new Date(dateFrom).getTime(),
      end_time: new Date(dateTo).getTime(),
      histogram_options: { num_boxes: 10 }, // (eiriklv): This should be chosen by user at some point
      tag:
        sourceItem?.type === 'timeseries'
          ? (sourceItem as ChartTimeSeries).tsExternalId!
          : undefined!,
      calculation_id:
        sourceItem?.type === 'workflow'
          ? (sourceItem as ChartWorkflow).calls?.[0].callId
          : undefined,
    };

    const hashOfParams = getHash(statisticsParameters);

    if (hashOfParams === statisticsCall?.hash) {
      return;
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
  }, [
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
  ]);

  return {
    results: statisticsData?.results,
  };
};

export const getDisplayUnit = (preferredUnit?: string) => {
  return (
    (
      units.find(
        (unitOption) => unitOption.value === preferredUnit?.toLowerCase()
      ) || {}
    ).label || preferredUnit
  );
};

export const formatNumber = (number: number) =>
  new Intl.NumberFormat(undefined, { notation: 'engineering' })
    .format(number)
    .replace('E0', '');
