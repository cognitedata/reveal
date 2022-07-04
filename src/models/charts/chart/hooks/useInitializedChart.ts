import { useEffect } from 'react';
import dayjs from 'dayjs';
import { useChart, useUpdateChart } from 'hooks/charts-storage';
import {
  updateChartDateRange,
  updateWorkflowsFromV1toV2,
  updateWorkflowsToSupportVersions,
} from 'models/charts/charts/selectors/updates';
import chartAtom from 'models/charts/charts/atoms/atom';
import { useRecoilState } from 'recoil';
import useOperations from 'models/calculation-backend/operations/queries/useOperations';

const useInitializedChart = (chartId: string) => {
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
  const { data: operations } = useOperations();

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

export default useInitializedChart;
