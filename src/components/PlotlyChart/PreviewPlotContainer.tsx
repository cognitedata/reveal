import { DatapointsMultiQuery } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { Chart } from 'models/chart/types';
import { WorkflowState } from 'models/calculation-results/types';
import { calculateGranularity } from 'utils/timeseries';
import { TimeseriesEntry } from 'models/timeseries-results/types';
import { Icon } from '@cognite/cogs.js';
import { CalculationResultQueryAggregateEnum } from '@cognite/calculation-backend';
import { fetchCalculationQueryResult } from 'services/calculation-backend';
import { ChartingContainer, LoadingContainer } from './elements';
import { cleanTimeseriesCollection, cleanWorkflowCollection } from './utils';
import PlotlyChart from './PlotlyChart';

const POINTS_PER_SERIES_IN_PREVIEW = 100;

type Props = {
  chart?: Chart;
  isMinMaxShown?: boolean;
  mergeUnits?: boolean;
};

const PreviewPlotContainer = ({
  chart = undefined,
  isMinMaxShown = false,
  mergeUnits = false,
}: Props) => {
  const sdk = useSDK();
  const pointsPerSeries = POINTS_PER_SERIES_IN_PREVIEW;

  /**
   * Get local chart context
   */
  const dateFrom = chart?.dateFrom;
  const dateTo = chart?.dateTo;

  const timeseriesQueries =
    chart?.timeSeriesCollection?.map(({ tsExternalId }) => ({
      items: [{ externalId: tsExternalId }],
      start: dayjs(dateFrom).toDate(),
      end: dayjs(dateTo).toDate(),
      granularity: calculateGranularity(
        [dayjs(dateFrom).valueOf(), dayjs(dateTo).valueOf()],
        pointsPerSeries
      ),
      aggregates: ['average'],
      limit: pointsPerSeries,
    })) || [];

  /**
   * Load data to preview (time series)
   */
  const {
    data: timeseriesPreview = [],
    isFetching: isFetchingTimeseriesPreview,
  } = useQuery(
    ['chart-data', 'timeseries', timeseriesQueries],
    () => {
      return Promise.allSettled(
        timeseriesQueries.map((q) =>
          sdk.datapoints.retrieve(q as DatapointsMultiQuery).then((r) => r[0])
        )
      ).then((results) => {
        return results
          .map((result) => ('value' in result ? result.value : undefined))
          .filter(Boolean)
          .map((series) => {
            return {
              externalId: series?.externalId,
              loading: false,
              series,
            } as TimeseriesEntry;
          });
      });
    },
    {
      enabled: !!chart,
    }
  );

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

  const workflowsWithCallIds = (chart?.workflowCollection || []).filter(
    (wf) => wf.calls?.[0]
  );

  /**
   * Load data to preview (calculations)
   */
  const {
    data: calculationsPreview = [],
    isFetching: isFetchingCalculationsPreview,
  } = useQuery(
    ['chart-data', 'calculations', calculationResultQuery],
    async () => {
      const results = await Promise.allSettled(
        workflowsWithCallIds.map(async (wf) => {
          const datapoints = await fetchCalculationQueryResult(
            sdk,
            String(wf.calls?.[0].callId),
            calculationResultQuery
          );

          return { ...datapoints, id: wf.id };
        })
      );

      const formattedResults = results
        .map((result) => ('value' in result ? result.value : undefined))
        .filter(Boolean) as WorkflowState[];

      return formattedResults;
    },
    {
      enabled: !!chart,
    }
  );

  /**
   * Filter out callIDs that trigger unnecessary recalcs/rerenders
   */
  const tsCollectionAsString = JSON.stringify(
    cleanTimeseriesCollection(chart?.timeSeriesCollection || [])
  );
  const wfCollectionAsString = JSON.stringify(
    cleanWorkflowCollection(chart?.workflowCollection || [])
  );

  const timeseries = useMemo(
    () => JSON.parse(tsCollectionAsString),
    [tsCollectionAsString]
  );

  const calculations = useMemo(
    () => JSON.parse(wfCollectionAsString),
    [wfCollectionAsString]
  );

  const timeseriesData = timeseriesPreview;
  const calculationsData = calculationsPreview;
  const thresholds = chart?.thresholdCollection;

  const hasValidDates =
    !Number.isNaN(new Date(dateFrom || '').getTime()) &&
    !Number.isNaN(new Date(dateTo || '').getTime());

  if (!hasValidDates) {
    return null;
  }

  const plotProps: React.ComponentProps<typeof PlotlyChart> = {
    dateFrom,
    dateTo,
    timeseries,
    timeseriesData,
    calculations,
    calculationsData,
    thresholds,
    isYAxisShown: false,
    isMinMaxShown,
    isPreview: true,
    mergeUnits,
  };

  const isFetchingPreview =
    isFetchingCalculationsPreview || isFetchingTimeseriesPreview;

  return (
    <ChartingContainer>
      {isFetchingPreview ? (
        <LoadingContainer>
          <Icon type="Loader" />
        </LoadingContainer>
      ) : (
        <PlotlyChart {...plotProps} />
      )}
    </ChartingContainer>
  );
};

export default PreviewPlotContainer;
