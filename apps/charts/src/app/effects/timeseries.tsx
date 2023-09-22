import { useEffect } from 'react';

import chartAtom from '@charts-app/models/chart/atom';
import { timeseriesAtom } from '@charts-app/models/timeseries-results/atom';
import { fetchRawOrAggregatedDatapoints } from '@charts-app/services/cdf-api';
import { CHART_POINTS_PER_SERIES } from '@charts-app/utils/constants';
import { calculateGranularity } from '@charts-app/utils/timeseries';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import { useRecoilState } from 'recoil';
import { useDebounce } from 'use-debounce';

import { ChartTimeSeries } from '@cognite/charts-lib';
import { DatapointsMultiQuery } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export function TimeseriesCollectionEffects() {
  const [chart] = useRecoilState(chartAtom);

  const timeseriesEffectElements = chart?.timeSeriesCollection?.map(
    (timeseries) => (
      <TimeseriesEffects key={timeseries.id} timeseries={timeseries} />
    )
  );

  return <>{timeseriesEffectElements}</>;
}

function TimeseriesEffects({ timeseries }: { timeseries: ChartTimeSeries }) {
  const { tsExternalId } = timeseries;
  const [chart] = useRecoilState(chartAtom);
  const { dateFrom, dateTo } = chart!;
  const [, setLocalTimeseries] = useRecoilState(timeseriesAtom);
  const sdk = useSDK();

  const [debouncedRange] = useDebounce({ dateFrom, dateTo }, 50, {
    equalityFn: (l, r) => isEqual(l, r),
  });

  const query: DatapointsMultiQuery = {
    items: [{ externalId: tsExternalId || '' }],
    start: dayjs(debouncedRange.dateFrom!).toDate(),
    end: dayjs(debouncedRange.dateTo!).toDate(),
    granularity: calculateGranularity(
      [
        dayjs(debouncedRange.dateFrom!).valueOf(),
        dayjs(debouncedRange.dateTo!).valueOf(),
      ],
      CHART_POINTS_PER_SERIES
    ),
    aggregates: ['average', 'min', 'max', 'count', 'sum'],
    limit: CHART_POINTS_PER_SERIES,
  };

  const {
    data: timeseriesData,
    isFetching,
    isSuccess,
  } = useQuery(
    ['chart-data', 'timeseries', timeseries.tsExternalId, query],
    () => fetchRawOrAggregatedDatapoints(sdk, query),
    {
      enabled: !!timeseries.tsExternalId,
    }
  );

  useEffect(() => {
    setLocalTimeseries((timeseriesCollection) => {
      const existingEntry = timeseriesCollection.find(
        (entry) => entry.externalId === timeseries.tsExternalId
      );

      const output = timeseriesCollection
        .filter((entry) => entry.externalId !== timeseries.tsExternalId)
        .concat({
          externalId: timeseries.tsExternalId || '',
          loading: isFetching,
          series: isSuccess ? timeseriesData : existingEntry?.series,
        });

      return output;
    });
  }, [
    isSuccess,
    isFetching,
    timeseriesData,
    setLocalTimeseries,
    timeseries.id,
    timeseries.tsExternalId,
  ]);

  return null;
}
