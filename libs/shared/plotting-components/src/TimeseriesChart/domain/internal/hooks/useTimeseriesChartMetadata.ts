import { useMemo } from 'react';
import { DEFAULT_NUMBER_OF_POINTS } from '../../../constants';
import { DataFetchOptions } from '../../../types';

import { useTimeseriesSingleAggregateQuery } from '../../service/queries';

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
  const { timeseriesId, dateRange } = query;

  const { data, isFetched, isInitialLoading } =
    useTimeseriesSingleAggregateQuery({
      query: {
        id: timeseriesId,
        aggregates: ['count'],
        start: dateRange?.[0].valueOf(),
        end: dateRange?.[1].valueOf(),
      },
    });

  const metadata: TimeseriesChartMetadata = useMemo(() => {
    const numberOfPoints =
      query.numberOfPoints || data?.data.count || DEFAULT_NUMBER_OF_POINTS;

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
    };
  }, [data, dataFetchOptions, query.numberOfPoints]);

  return {
    data: metadata,
    isFetched,
    isInitialLoading,
  };
};
