import { useQuery, UseQueryOptions } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import {
  getTimeseriesMetadataValuesAggregate,
  TimeseriesMetadataAggregateResponse,
  queryKeys,
  TimeseriesProperties,
  AdvancedFilter,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { InternalTimeseriesFilters } from '@data-exploration-lib/core';

interface Props {
  metadataKey?: string | null;
  query?: string;
  advancedFilter?: AdvancedFilter<TimeseriesProperties>;
  filter?: InternalTimeseriesFilters;
  options?: UseQueryOptions<
    TimeseriesMetadataAggregateResponse[],
    unknown,
    TimeseriesMetadataAggregateResponse[],
    any
  >;
}

export const useTimeseriesMetadataValuesAggregateQuery = ({
  metadataKey,
  query,
  advancedFilter,
  filter,
  options,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.timeseriesMetadataValues(
      String(metadataKey),
      query,
      advancedFilter,
      filter
    ),
    () => {
      return getTimeseriesMetadataValuesAggregate(sdk, String(metadataKey), {
        advancedFilter,
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
