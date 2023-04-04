import { useQuery, UseQueryOptions } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import {
  getTimeseriesMetadataValuesAggregate,
  TimeseriesMetadataAggregateResponse,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import {
  InternalTimeseriesFilters,
  OldTimeseriesFilters,
} from '@data-exploration-lib/core';

export const useTimeseriesMetadataValuesAggregateQuery = (
  metadataKey?: string | null,
  query?: string,
  filter?: InternalTimeseriesFilters | OldTimeseriesFilters,
  options?: UseQueryOptions<
    TimeseriesMetadataAggregateResponse[],
    unknown,
    TimeseriesMetadataAggregateResponse[],
    any
  >
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.timeseriesMetadataValues(String(metadataKey), query, filter),
    () => {
      return getTimeseriesMetadataValuesAggregate(sdk, String(metadataKey), {
        filter: transformNewFilterToOldFilter(filter),
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      enabled:
        !isEmpty(metadataKey) &&
        (isUndefined(options?.enabled) ? true : options?.enabled),
      ...options,
    }
  );
};
