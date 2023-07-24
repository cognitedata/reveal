import { useMemo } from 'react';

import { DataFetchOptions } from '../../../types';
import { getIdEither } from '../../../utils/getIdEither';
import { useTimeseriesSingleAggregateQuery } from '../../service/queries';
import { CHART_POINTS_PER_SERIES } from '../constants';
import { TimeseriesChartMetadata, TimeseriesChartQuery } from '../types';
import { getDataFetchMode } from '../utils';

import { useTimeseriesColor } from './useTimeseriesColor';

interface Props {
  query: TimeseriesChartQuery;
  dataFetchOptions?: DataFetchOptions;
}

export const useTimeseriesChartMetadata = ({
  query,
  dataFetchOptions,
}: Props) => {
  const { timeseries, dateRange } = query;

  const {
    data: aggregates = [],
    isFetched,
    isInitialLoading,
  } = useTimeseriesSingleAggregateQuery({
    query: {
      items: timeseries.map(getIdEither),
      aggregates: ['count'],
      start: dateRange?.[0].valueOf(),
      end: dateRange?.[1].valueOf(),
    },
  });

  const getTimeseriesColor = useTimeseriesColor(timeseries);

  const metadata: TimeseriesChartMetadata[] = useMemo(() => {
    return aggregates.map((aggregate) => {
      const {
        id,
        externalId,
        data: { count: aggregateCount = CHART_POINTS_PER_SERIES },
        isString,
        isStep,
        unit,
      } = aggregate;

      const numberOfPoints = Math.min(
        query.numberOfPoints || aggregateCount,
        CHART_POINTS_PER_SERIES
      );

      const dataFetchMode = getDataFetchMode({
        numberOfPoints,
        dataFetchOptions,
        isString,
      });

      return {
        id,
        externalId,
        numberOfPoints,
        dataFetchMode,
        isStep,
        isString,
        unit,
        color: getTimeseriesColor({ id, externalId }),
      };
    });
  }, [aggregates, dataFetchOptions, getTimeseriesColor, query.numberOfPoints]);

  return {
    data: metadata,
    isFetched,
    isInitialLoading,
  };
};
