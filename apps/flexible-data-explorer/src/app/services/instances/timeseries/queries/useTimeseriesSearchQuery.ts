import { useMemo } from 'react';

import { Timeseries } from '@cognite/sdk';
import { useInfiniteSearch } from '@cognite/sdk-react-query-hooks';

import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '../../../../hooks/useParams';
import { useProjectConfig } from '../../../../hooks/useProjectConfig';
import { buildTimeseriesFilter } from '../../../../utils/filterBuilder';

export const useTimeseriesSearchQuery = (limit?: number) => {
  const config = useProjectConfig();

  const [query] = useSearchQueryParams();

  const [timeseriesFilterParams] = useDataTypeFilterParams('Timeseries');
  const filter = useMemo(
    () => buildTimeseriesFilter(timeseriesFilterParams, config),
    [timeseriesFilterParams, config]
  );

  const { data, ...rest } = useInfiniteSearch<Timeseries>(
    'timeseries',
    query,
    limit,
    filter
  );

  const results = useMemo(() => {
    return data?.pages.flat() || [];
  }, [data]);

  return { data: results, ...rest };
};
