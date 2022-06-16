/* eslint camelcase: 0 */
import { useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import { useChart, useUpdateChart } from 'hooks/charts-storage';
import {
  ChartWorkflowV2,
  Chart,
  ChartTimeSeries,
  ChartWorkflow,
} from 'models/chart/types';
import {
  updateChartDateRange,
  updateWorkflowsFromV1toV2,
  updateWorkflowsToSupportVersions,
} from 'models/chart/updates';
import chartAtom from 'models/chart/atom';
import { useFilePicker } from 'use-file-picker';
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
import { useCluster, useProject } from 'hooks/config';
import { usePrevious } from 'react-use';
import { useRecoilState } from 'recoil';
import { useOperations } from 'models/operations/atom';

export const useInitializedChart = (chartId: string) => {
  /**
   * Get stored chart
   */
  const { data: originalChart, isError, isFetched } = useChart(chartId);

  /**
   * Get local chart context
   */
  const [chart, setChart] = useRecoilState(chartAtom);

  /**
   * Method for updating storage value of chart
   */
  const { mutate: updateChart } = useUpdateChart();

  /**
   * Get all available operations (needed for migration)
   */
  const [, , operations] = useOperations();

  /**
   * Initialize local chart atom
   */
  useEffect(() => {
    if ((chart && chart.id === chartId) || !originalChart) {
      return;
    }

    if (!operations || !operations.length) {
      return;
    }

    /**
     * Fallback date range to default 1M if saved dates are not valid
     */
    const dateFrom = Date.parse(originalChart.dateFrom!)
      ? originalChart.dateFrom!
      : dayjs().subtract(1, 'M').toISOString();
    const dateTo = Date.parse(originalChart.dateTo!)
      ? originalChart.dateTo!
      : dayjs().toISOString();

    const updatedChart = [originalChart]
      .map((_chart) => updateChartDateRange(_chart, dateFrom, dateTo))
      /**
       * Convert/migrate workflows using @cognite/connect to the format supported by React Flow (v2)
       */
      .map((_chart) => updateWorkflowsFromV1toV2(_chart, operations))
      /**
       * Convert/migrate from v2 format to v3 (toolFunction -> selectedOperation, functionData -> parameterValues, etc...)
       */
      .map((_chart) => updateWorkflowsToSupportVersions(_chart))[0];

    /**
     * Add chart to local state atom
     */
    setChart(updatedChart);
  }, [originalChart, chart, chartId, setChart, operations]);

  /**
   * Sync local chart atom to storage
   */
  useEffect(() => {
    if (chart) {
      updateChart(chart);
    }
  }, [chart, updateChart]);

  /**
   * Consolidate loading states
   */
  const isLoading = !isFetched || (isFetched && originalChart && !chart);

  /**
   * Envelope
   */
  return { data: chart, isLoading, isError };
};

export const useUploadCalculations = ({
  onSuccess,
  onError,
}: {
  onSuccess: (calculations: ChartWorkflowV2[]) => void;
  onError: (error: Error) => void;
}) => {
  /**
   * File upload handling
   */
  const [openFileSelector, { filesContent, loading }] = useFilePicker({
    accept: '.json',
    readAs: 'Text',
  });

  const handleImportCalculations = useCallback(
    (string) => {
      let calculations: ChartWorkflowV2[] = [];
      try {
        calculations = JSON.parse(string);
      } catch (err) {
        onError(err as Error);
      }
      onSuccess(calculations);
    },
    [onSuccess, onError]
  );

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!filesContent.length) {
      return;
    }
    handleImportCalculations(filesContent[0].content);
  }, [filesContent, loading, handleImportCalculations]);

  return openFileSelector;
};

export const useFusionLink = (path: string) => {
  const [cluster] = useCluster();
  const project = useProject();

  return `https://fusion.cognite.com/${project}${path}${
    cluster && `?env=${cluster}`
  }`;
};

export const useStatistics = (
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined,
  dateFrom: string,
  dateTo: string,
  enabled: boolean = true
) => {
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
  });

  const { data: statisticsData } = useQuery({
    queryKey: ['statistics', 'result', statisticsCall?.callId],
    queryFn: () => fetchStatisticsResult(sdk, statisticsCall?.callId || ''),
    retry: true,
    retryDelay: 1000,
    enabled: callStatus?.status === StatusStatusEnum.Success,
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

  return { results: statisticsData?.results, status };
};
