import { CalculationResultQueryAggregateEnum } from '@cognite/calculation-backend';
import { useSDK } from '@cognite/sdk-provider';
import { DatapointsMultiQuery } from '@cognite/sdk';
import dayjs from 'dayjs';
import { WorkflowState } from 'models/calculation-results/types';
import { Chart } from 'models/chart/types';
import { TimeseriesEntry } from 'models/timeseries-results/types';
import { useQuery } from 'react-query';
import { fetchCalculationQueryResult } from 'services/calculation-backend';
import { calculateGranularity } from 'utils/timeseries';
import { useMemo } from 'react';

const POINTS_PER_SERIES_IN_PREVIEW = 100;

export const usePreviewData = (chart?: Chart) => {
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
  const { data: timeseriesData = [], isFetching: isFetchingTimeseriesPreview } =
    useQuery(
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
    data: calculationsData = [],
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

  const isLoading =
    isFetchingTimeseriesPreview || isFetchingCalculationsPreview;

  return {
    timeseriesData,
    calculationsData,
    isLoading,
  };
};
