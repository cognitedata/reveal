import { useMemo } from 'react';

import { DataFetchOptions } from '../../../types';
import { getIdEither } from '../../../utils/getIdEither';
import { useTimeseriesSingleAggregateQuery } from '../../service/queries';
import { CHART_POINTS_PER_SERIES } from '../constants';
import { TimeseriesChartMetadata, TimeseriesChartQuery } from '../types';
import { getDataFetchMode } from '../utils';

interface Props {
  query: TimeseriesChartQuery;
  dataFetchOptions?: DataFetchOptions;
}

export const useTimeseriesChartMetadata = ({
  query,
  dataFetchOptions,
}: Props) => {
  const { timeseries, dateRange } = query;

  const { data, isFetched, isInitialLoading } =
    useTimeseriesSingleAggregateQuery({
      query: {
        ...getIdEither(timeseries),
        aggregates: ['count'],
        start: dateRange?.[0].valueOf(),
        end: dateRange?.[1].valueOf(),
      },
    });

  const metadata: TimeseriesChartMetadata = useMemo(() => {
    const numberOfPoints = Math.min(
      query.numberOfPoints || data?.data.count || CHART_POINTS_PER_SERIES,
      CHART_POINTS_PER_SERIES
    );

    const isString = data?.isString;

    const dataFetchMode = getDataFetchMode({
      numberOfPoints,
      dataFetchOptions,
      isString,
    });

    return {
      numberOfPoints,
      dataFetchMode,
      isStep: data?.isStep,
      isString,
      unit: data?.unit,
    };
  }, [data, dataFetchOptions, query.numberOfPoints]);

  return {
    data: metadata,
    isFetched,
    isInitialLoading,
  };
};
