import { CogniteClient, DatapointsMultiQuery } from '@cognite/sdk';
import dayjs from 'dayjs';
import { calculateGranularity } from 'utils/timeseries';
import { ComponentProps } from 'react';
import { Chart } from 'models/charts/charts/types/types';
import {
  cleanTimeseriesCollection,
  cleanWorkflowCollection,
} from 'components/PlotlyChart/utils';
import PlotlyChart from 'components/PlotlyChart/PlotlyChart';
import { WorkflowState } from 'models/calculation-backend/calculation-results/types';
import { TimeseriesEntry } from 'models/charts/timeseries-results/types';

const fetchPlotlyPropsPreview = async (
  chart: Chart | undefined = undefined,
  sdk: CogniteClient,
  calculationsData: WorkflowState[]
): Promise<ComponentProps<typeof PlotlyChart>> => {
  const pointsPerSeries = 100;

  /**
   * Get local chart context
   */
  const dateFrom = chart?.dateFrom;
  const dateTo = chart?.dateTo;

  const queries =
    chart?.timeSeriesCollection?.map(({ tsExternalId }) => ({
      items: [{ externalId: tsExternalId }],
      start: dayjs(dateFrom).toDate(),
      end: dayjs(dateTo).toDate(),
      granularity: calculateGranularity(
        [dayjs(dateFrom).valueOf(), dayjs(dateTo).valueOf()],
        pointsPerSeries
      ),
      aggregates: ['average', 'min', 'max', 'count', 'sum'],
      limit: pointsPerSeries,
    })) || [];

  /**
   * This is only used for the overview preview mode
   */
  const timeseriesPreview = await Promise.allSettled(
    queries.map((q) =>
      sdk.datapoints.retrieve(q as DatapointsMultiQuery).then((r) => r[0])
    )
  ).then((results) =>
    results
      .map((result) => ('value' in result ? result.value : undefined))
      .filter(Boolean)
      .map((series) => {
        return {
          externalId: series?.externalId,
          loading: false,
          series,
        } as TimeseriesEntry;
      })
  );

  const plotProps = {
    dateFrom,
    dateTo,
    timeseries: cleanTimeseriesCollection(chart?.timeSeriesCollection || []),
    timeseriesData: timeseriesPreview,
    calculations: cleanWorkflowCollection(chart?.workflowCollection || []),
    calculationsData,
    isYAxisShown: false,
    isPreview: true,
    onPlotNavigation: () => {},
  };

  return plotProps;
};

export default fetchPlotlyPropsPreview;
