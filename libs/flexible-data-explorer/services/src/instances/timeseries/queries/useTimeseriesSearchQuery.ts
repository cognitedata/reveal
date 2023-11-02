import { useMemo } from 'react';

import { useSelectedSiteConfig } from '@fdx/shared/hooks/useConfig';
import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '@fdx/shared/hooks/useParams';

import { buildTimeseriesAdvancedFilter } from '../transformers';

import { useTimeseriesListQuery } from './useTimeseriesListQuery';

export const useTimeseriesSearchQuery = (limit?: number) => {
  const siteConfig = useSelectedSiteConfig();

  const [query] = useSearchQueryParams();

  const [timeseriesFilterParams] = useDataTypeFilterParams('Timeseries');

  const advancedFilter = useMemo(
    () =>
      buildTimeseriesAdvancedFilter({
        params: timeseriesFilterParams,
        query,
        config: siteConfig,
      }),
    [timeseriesFilterParams, query, siteConfig]
  );

  return useTimeseriesListQuery({
    advancedFilter,
    limit,
  });
};
