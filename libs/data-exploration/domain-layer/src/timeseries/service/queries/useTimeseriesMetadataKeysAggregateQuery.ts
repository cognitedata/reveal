import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';

import {
  AdvancedFilter,
  getTimeseriesMetadataKeysAggregate,
  queryKeys,
  TimeseriesProperties,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import { TimeseriesMetadataAggregateResponse } from '../types';
import { InternalTimeseriesFilters } from '@data-exploration-lib/core';

interface Props {
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

export const useTimeseriesMetadataKeysAggregateQuery = ({
  query,
  advancedFilter,
  filter,
  options,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.timeseriesMetadata(query, advancedFilter, filter),
    () => {
      return getTimeseriesMetadataKeysAggregate(sdk, {
        advancedFilter,
        filter: transformNewFilterToOldFilter(filter),
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    options
  );
};
