import { useEffect, useCallback } from 'react';

import { useCreateDataProfiling } from '@charts-app/hooks/calculation-backend';
import { usePrevious } from '@charts-app/hooks/usePrevious';
import chartAtom from '@charts-app/models/chart/atom';
import {
  waitForDataProfilingToFinish,
  waitForCalculationToFinish,
  fetchDataProfilingResult,
} from '@charts-app/services/calculation-backend';
import { getHash } from '@charts-app/utils/hash';
import { useQuery } from '@tanstack/react-query';
import { useRecoilState } from 'recoil';
import { useDebounce } from 'use-debounce';

import {
  CreateDataProfilingParams,
  StatusStatusEnum,
} from '@cognite/calculation-backend';
import {
  Chart,
  ChartTimeSeries,
  ChartWorkflow,
  ChartSource,
} from '@cognite/charts-lib';
import { useSDK } from '@cognite/sdk-provider';

export const useDataProfiling = (
  sourceItem: ChartSource | undefined,
  dateFrom: string,
  dateTo: string,
  enabled: boolean
) => {
  const sdk = useSDK();
  // @ts-ignore todo(DEGR-2458) should dataProfiling be enabled for scheduled calculation?
  const dataProfilingCall = sourceItem?.dataProfilingCalls?.[0];
  const [, setChart] = useRecoilState(chartAtom);
  const sourceId = sourceItem?.id;
  const previousSourceId = usePrevious<string | undefined>(sourceId);
  const sourceChanged = sourceId !== previousSourceId;

  const datesAsString = JSON.stringify({ dateFrom, dateTo });
  const [debouncedDatesAsString] = useDebounce(datesAsString, 3000);
  const debouncedPrevDatesAsString = usePrevious<string>(
    debouncedDatesAsString
  );

  const {
    data: callStatus,
    error: callStatusError,
    isFetching: isFetchingCallStatus,
    isInitialLoading: isInitialLoadingCallstatus,
  } = useQuery({
    queryKey: ['data_profiling', 'status', dataProfilingCall?.callId],
    queryFn: async () => {
      return waitForDataProfilingToFinish(
        sdk,
        String(dataProfilingCall?.callId)
      );
    },
    enabled: !!dataProfilingCall?.callId,
  });

  const { data: dataProfilingData } = useQuery({
    queryKey: ['data_profiling', 'result', dataProfilingCall?.callId],
    queryFn: () =>
      fetchDataProfilingResult(sdk, dataProfilingCall?.callId || ''),
    retry: true,
    retryDelay: 1000,
    enabled: callStatus?.status === StatusStatusEnum.Success,
  });

  const { results: dataProfilingResults } = dataProfilingData || {};
  const { mutate: callFunction } = useCreateDataProfiling();
  const memoizedCallFunction = useCallback(callFunction, [callFunction]);

  const updateDataProfiling = useCallback(
    (diff: Partial<ChartTimeSeries | ChartWorkflow>) => {
      if (!sourceItem) return;
      setChart((oldChart) => {
        if (!oldChart) {
          return undefined;
        }

        return {
          ...oldChart,
          timeSeriesCollection: oldChart?.timeSeriesCollection?.map(
            (ts: ChartTimeSeries) =>
              ts.id === sourceItem.id
                ? {
                    ...ts,
                    ...diff,
                  }
                : ts
          ),
          workflowCollection: oldChart?.workflowCollection?.map(
            (wf: ChartWorkflow) =>
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

  async function createDataProfiling(
    params: CreateDataProfilingParams,
    hash: number
  ) {
    if ('calculation_id' in params && params.calculation_id) {
      await waitForCalculationToFinish(sdk, params.calculation_id);
    }

    memoizedCallFunction(params, {
      onSuccess({ id: callId }) {
        updateDataProfiling({
          dataProfilingCalls: [
            {
              callDate: Date.now(),
              callId,
              hash,
            },
          ],
        });
      },
    });
  }

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!sourceItem) {
      return;
    }

    if (!sourceChanged && !datesChanged) {
      if (dataProfilingResults) {
        return;
      }
      if (dataProfilingCall && !callStatusError) {
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

    const dataProfilingParameters: CreateDataProfilingParams = {
      start_time: new Date(dateFrom).getTime(),
      end_time: new Date(dateTo).getTime(),
      histogram_options: { num_boxes: 10 },
      parameters: {
        get_gaps: {
          gap_detection_method: 'iqr',
        },
      },
      ...(sourceItem.type === 'timeseries'
        ? {
            tag: identifier,
            metadata: {
              chart_id: String((sourceItem as ChartTimeSeries).tsId),
            },
          }
        : {
            calculation_id: identifier,
          }),
    };

    const hashOfParams = getHash(dataProfilingParameters);

    if (hashOfParams === dataProfilingCall?.hash && !callStatusError) {
      return;
    }

    createDataProfiling(dataProfilingParameters, hashOfParams);
  }, [
    sdk,
    memoizedCallFunction,
    dateFrom,
    dateTo,
    sourceItem,
    updateDataProfiling,
    dataProfilingResults,
    dataProfilingCall,
    callStatus,
    callStatusError,
    datesChanged,
    sourceChanged,
    enabled,
  ]);

  return {
    results: dataProfilingData?.results,
    error: dataProfilingData?.error,
    status:
      isInitialLoadingCallstatus || isFetchingCallStatus
        ? StatusStatusEnum.Running
        : callStatus?.status,
  };
};
