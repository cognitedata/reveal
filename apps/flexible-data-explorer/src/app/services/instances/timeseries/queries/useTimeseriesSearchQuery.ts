import { useMemo } from 'react';

import { Timeseries, TimeseriesFilter } from '@cognite/sdk';
import { useInfiniteSearch } from '@cognite/sdk-react-query-hooks';

export const useTimeseriesSearchQuery = (
  query: string,
  limit?: number,
  filter?: TimeseriesFilter
) => {
  const { data, ...rest } = useInfiniteSearch<Timeseries>(
    'timeseries',
    query,
    limit,
    filter
  );

  const results = useMemo(() => {
    return data?.pages.flatMap((page) => page) || [];
  }, [data]);

  return { data: results, ...rest };
};
