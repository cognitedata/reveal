/* eslint camelcase: 0 */
import { useCallback, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useRecoilState } from 'recoil';
import { useDebounce } from 'use-debounce';
import { useFilePicker } from 'use-file-picker';

import {
  CreateStatisticsParams,
  StatusStatusEnum,
} from '@cognite/calculation-backend';
import {
  ChartWorkflowV2,
  Chart,
  ChartTimeSeries,
  ChartWorkflow,
  ScheduledCalculation,
  ChartSource,
} from '@cognite/charts-lib';
import { useSDK } from '@cognite/sdk-provider';

import { useCreateStatistics } from '../../hooks/calculation-backend';
import { useChart, useUpdateChart } from '../../hooks/charts-storage';
import { usePrevious } from '../../hooks/usePrevious';
import chartAtom from '../../models/chart/atom';
import { updateDuplicateIds } from '../../models/chart/update-duplicate-ids';
import {
  updateChartDateRange,
  updateWorkflowsFromV1toV2,
  updateWorkflowsToSupportVersions,
} from '../../models/chart/updates';
import { useOperations } from '../../models/operations/atom';
import { useScheduledCalculationDataValue } from '../../models/scheduled-calculation-results/atom';
import {
  fetchStatisticsResult,
  waitForCalculationToFinish,
  waitForStatisticsToFinish,
} from '../../services/calculation-backend';
import { getHash } from '../../utils/hash';

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
      .map((_chart) => updateWorkflowsToSupportVersions(_chart))
      /**
       * Remove duplicate ids from workflows
       */
      .map((_chart) => updateDuplicateIds(_chart))[0];

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
    (string: string) => {
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

export const useStatistics = (
  sourceItem: ChartSource | undefined,
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
  const scheduledCalculationsData = useScheduledCalculationDataValue();

  /**
   * Using strings to avoid custom equality check
   */
  const datesAsString = JSON.stringify({ dateFrom, dateTo });

  const [debouncedDatesAsString] = useDebounce(datesAsString, 3000);
  const debouncedPrevDatesAsString = usePrevious<string>(
    debouncedDatesAsString
  );

  /**
   * Check statistic call status
   */
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

  /**
   * Get statistic data once the calls have been successful
   */
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
    (diff: Partial<ChartSource>) => {
      if (!sourceItem) return;
      setChart((oldChart) => {
        if (!oldChart) {
          return undefined;
        }

        function updateItemInCollection(
          collection:
            | ChartTimeSeries[]
            | ScheduledCalculation[]
            | ChartWorkflow[]
            | undefined,

          diff: Partial<ChartSource>,
          sourceItem: ChartSource
        ) {
          return collection?.map((item) =>
            item.id === sourceItem.id ? { ...item, ...diff } : item
          );
        }

        return {
          ...oldChart,
          timeSeriesCollection: updateItemInCollection(
            oldChart?.timeSeriesCollection,
            diff,
            sourceItem
          ),
          scheduledCalculationCollection: updateItemInCollection(
            oldChart?.scheduledCalculationCollection,
            diff,
            sourceItem
          ),
          workflowCollection: updateItemInCollection(
            oldChart?.workflowCollection,
            diff,
            sourceItem
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
    } else if (sourceItem.type === 'scheduledCalculation') {
      identifier =
        scheduledCalculationsData[(sourceItem as ScheduledCalculation).id]
          .targetTimeseriesExternalId;
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

    let identifierOption;

    if (
      sourceItem.type === 'timeseries' ||
      sourceItem.type === 'scheduledCalculation'
    ) {
      identifierOption = { tag: identifier };
    } else {
      identifierOption = { calculation_id: identifier };
    }

    const statisticsParameters: CreateStatisticsParams = {
      start_time: new Date(dateFrom).getTime(),
      end_time: new Date(dateTo).getTime(),
      histogram_options: { num_boxes: 10 }, // (eiriklv): This should be chosen by user at some point
      ...identifierOption,
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
    scheduledCalculationsData,
  ]);

  const status =
    isFetchingCallStatus || isLoadingCallstatus
      ? StatusStatusEnum.Running
      : callStatus?.status;

  return {
    results: statisticsData?.results,
    status,
    error: statisticsData?.error,
    warnings: statisticsData?.warnings,
  };
};
