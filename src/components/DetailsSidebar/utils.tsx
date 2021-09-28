/* eslint camelcase: 0 */

import { getProject } from 'hooks';
import { useCluster } from 'config';
import { useCallFunction, functionResponseKey } from 'utils/backendService';
import { useCallback, useEffect } from 'react';
import {
  ChartTimeSeries,
  ChartWorkflow,
  FunctionCallStatus,
} from 'reducers/charts/types';
import { useSDK } from '@cognite/sdk-provider';
import { useRecoilState } from 'recoil';
import { chartState } from 'atoms/chart';
import { usePrevious } from 'hooks/usePrevious';
import { useDebounce } from 'use-debounce';
import { useQuery } from 'react-query';
import { getCallResponse } from 'utils/backendApi';
import { units } from 'utils/units';
import { CogniteClient } from '@cognite/sdk';
import * as backendApi from 'utils/backendApi';
import { StatisticsResult } from '.';

export const useFusionLink = (path: string) => {
  const [cluster] = useCluster();

  return `https://fusion.cognite.com/${getProject()}${path}${
    cluster && `?env=${cluster}`
  }`;
};

const key = ['functions', 'individual_calc'];

const getCallStatus =
  (sdk: CogniteClient, fnId: number, callId: number) => async () => {
    const response = await backendApi.getCallStatus(sdk, fnId, callId);

    if (response?.status) {
      return response.status as FunctionCallStatus;
    }
    return Promise.reject(new Error('could not find call status'));
  };

export const useStatistics = (
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined
) => {
  const sdk = useSDK();
  const statisticsCall = (sourceItem?.statisticsCalls || [])[0];
  const [chart, setChart] = useRecoilState(chartState);
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

  const { data } = useQuery({
    queryKey: functionResponseKey(
      statisticsCall?.functionId,
      statisticsCall?.callId
    ),
    queryFn: (): Promise<string | undefined> =>
      getCallResponse(sdk, statisticsCall?.functionId, statisticsCall.callId),
    retry: 1,
    retryDelay: 1000,
    enabled: !!statisticsCall,
  });

  const { data: callStatus, error: callStatusError } =
    useQuery<FunctionCallStatus>(
      [...key, statisticsCall?.callId, 'call_status'],
      getCallStatus(
        sdk,
        statisticsCall?.functionId as number,
        statisticsCall?.callId as number
      ),
      {
        enabled: !!statisticsCall?.callId,
      }
    );

  const { results } = (data as any) || {};
  const { statistics = [], histogram_data: histogram = [] } =
    (results as StatisticsResult) || {};
  const statisticsForSource = statistics[0];
  const { mutate: callFunction } = useCallFunction('individual_calc-master');
  const memoizedCallFunction = useCallback(callFunction, [callFunction]);

  const updateStatistics = useCallback(
    (diff: Partial<ChartTimeSeries>) => {
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
      }));
    },
    [setChart, sourceItem]
  );

  const datesChanged =
    debouncedPrevDatesAsString &&
    debouncedPrevDatesAsString !== debouncedDatesAsString;

  useEffect(() => {
    if (sourceItem?.type !== 'timeseries') {
      return;
    }

    if (!sourceChanged) {
      if (!datesChanged) {
        if (statisticsForSource) {
          return;
        }
        if (statisticsCall && !callStatusError) {
          return;
        }
      }
    }

    memoizedCallFunction(
      {
        data: {
          calculation_input: {
            timeseries: [
              {
                tag: (sourceItem as ChartTimeSeries).tsExternalId,
                histogram_data: { num_boxes: 10 },
              },
            ],
            start_time: new Date(dateFrom).getTime(),
            end_time: new Date(dateTo).getTime(),
          },
        },
      },
      {
        onSuccess({ functionId, callId }) {
          updateStatistics({
            statisticsCalls: [
              {
                callDate: Date.now(),
                functionId,
                callId,
              },
            ],
          });
        },
      }
    );
  }, [
    memoizedCallFunction,
    dateFrom,
    dateTo,
    sourceItem,
    updateStatistics,
    statisticsForSource,
    statisticsCall,
    callStatus,
    callStatusError,
    datesChanged,
    sourceChanged,
  ]);

  return { statistics: statisticsForSource, histogram: histogram[0]?.data };
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

export const getHistogramRange = (
  min: number,
  max: number,
  nticks: number
): number[] => {
  const dtick = (max - min) / nticks;
  const result: number[] = [min];
  for (let i = 0; i < nticks; i++) {
    result.push(min + dtick * (i + 1));
  }
  return result;
};
