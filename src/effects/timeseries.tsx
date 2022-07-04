import { useSDK } from '@cognite/sdk-provider';
import { DatapointsMultiQuery } from '@cognite/sdk';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import chartAtom from 'models/charts/charts/atoms/atom';
import { ChartTimeSeries } from 'models/charts/charts/types/types';
import { timeseriesAtom } from 'models/charts/timeseries-results/atom';
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useRecoilState } from 'recoil';
import { fetchRawOrAggregatedDatapoints } from 'services/cdf-api';
import { useDebounce } from 'use-debounce';
import { CHART_POINTS_PER_SERIES } from 'utils/constants';
import { calculateGranularity } from 'utils/timeseries';

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
