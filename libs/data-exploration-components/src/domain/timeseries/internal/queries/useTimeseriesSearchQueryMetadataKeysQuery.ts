import {
  mapFiltersToTimeseriesAdvancedFilters,
  useTimeseriesListQuery,
  InternalTimeseriesFilters,
} from 'domain/timeseries';
import { mapMetadataKeysWithQuery } from 'domain/transformers';
import { isEmpty } from 'lodash';
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
