import { useMemo } from 'react';

import { useSelectedSiteConfig } from '@fdx/shared/hooks/useConfig';
import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '@fdx/shared/hooks/useParams';
import { buildTimeseriesFilter } from '@fdx/shared/utils/filterBuilder';

import { Timeseries } from '@cognite/sdk';
import { useInfiniteSearch } from '@cognite/sdk-react-query-hooks';

export const useTimeseriesSearchQuery = (limit?: number) => {
  const siteConfig = useSelectedSiteConfig();

  const [query] = useSearchQueryParams();

  const [timeseriesFilterParams] = useDataTypeFilterParams('Timeseries');
  const filter = useMemo(
    () => buildTimeseriesFilter(timeseriesFilterParams, siteConfig),
    [timeseriesFilterParams, siteConfig]
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
