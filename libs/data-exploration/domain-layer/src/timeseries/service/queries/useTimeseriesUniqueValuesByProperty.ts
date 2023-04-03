import { useQuery } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  getTimeseriesUniqueValuesByProperty,
  queryKeys,
  TimeseriesProperty,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import {
  InternalTimeseriesFilters,
  OldTimeseriesFilters,
} from '@data-exploration-lib/core';

export const useTimeseriesUniqueValuesByProperty = (
  property: TimeseriesProperty,
  query?: string,
  filter?: InternalTimeseriesFilters | OldTimeseriesFilters
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.timeseriesUniqueValues(property, query, filter),
    () => {
      return getTimeseriesUniqueValuesByProperty(sdk, property, {
        filter: transformNewFilterToOldFilter(filter),
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    }
  );
};
