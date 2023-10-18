import { useMemo } from 'react';

import { Timeseries } from '@cognite/sdk';
import { useInfiniteSearch } from '@cognite/sdk-react-query-hooks';

import { useSelectedSiteConfig } from '../../../../hooks/useConfig';
import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '../../../../hooks/useParams';
import { buildTimeseriesFilter } from '../../../../utils/filterBuilder';

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
