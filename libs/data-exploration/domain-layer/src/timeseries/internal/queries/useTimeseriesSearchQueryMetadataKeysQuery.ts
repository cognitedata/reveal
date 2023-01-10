import {
  mapFiltersToTimeseriesAdvancedFilters,
  useTimeseriesListQuery,
  InternalTimeseriesFilters,
} from '@data-exploration-lib/domain-layer';
import { mapMetadataKeysWithQuery } from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import { useMemo } from 'react';

export const useTimeseriesSearchQueryMetadataKeysQuery = (
  query: string | undefined,
  timeseriesFilters: InternalTimeseriesFilters
) => {
  const advancedFilter = useMemo(
    () => mapFiltersToTimeseriesAdvancedFilters(timeseriesFilters),
    [timeseriesFilters]
  );

  const { data } = useTimeseriesListQuery(
    { advancedFilter },
    { enabled: !isEmpty(query) }
  );

  return useMemo(() => mapMetadataKeysWithQuery(data, query), [data, query]);
};
