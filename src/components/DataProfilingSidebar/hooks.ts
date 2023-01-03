import { useEffect, useCallback } from 'react';
import { Chart, ChartTimeSeries, ChartWorkflow } from 'models/chart/types';
import { useSDK } from '@cognite/sdk-provider';
import { useRecoilState } from 'recoil';
import chartAtom from 'models/chart/atom';
import { usePrevious } from 'react-use';
import { useDebounce } from 'use-debounce';
import { useQuery } from 'react-query';
import { getHash } from 'utils/hash';
import { useCreateDataProfiling } from 'hooks/calculation-backend';
import {
  waitForDataProfilingToFinish,
  waitForCalculationToFinish,
  fetchDataProfilingResult,
} from 'services/calculation-backend';
import {
  CreateDataProfilingParams,
  StatusStatusEnum,
} from '@cognite/calculation-backend';

export const useDataProfiling = (
  sourceItem: ChartTimeSeries | ChartWorkflow | undefined,
  dateFrom: string,
  dateTo: string,
  enabled: boolean
) => {
  const sdk = useSDK();
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
    isLoading: isLoadingCallstatus,
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

    async function createDataProfiling() {
      if (
        'calculation_id' in dataProfilingParameters &&
        dataProfilingParameters.calculation_id
      ) {
        await waitForCalculationToFinish(
          sdk,
          dataProfilingParameters.calculation_id
        );
      }

      memoizedCallFunction(dataProfilingParameters, {
        onSuccess({ id: callId }) {
          updateDataProfiling({
            dataProfilingCalls: [
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

    createDataProfiling();
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
      isFetchingCallStatus || isLoadingCallstatus
        ? StatusStatusEnum.Running
        : callStatus?.status,
  };
};
