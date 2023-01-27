import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';

import {
  getTimeseriesMetadataKeysAggregate,
  InternalTimeseriesFilters,
  OldTimeseriesFilters,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import { TimeseriesMetadataAggregateResponse } from '../types';

export const useTimeseriesMetadataKeysAggregateQuery = (
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
    queryKeys.timeseriesMetadata(filter),
    () => {
      return getTimeseriesMetadataKeysAggregate(sdk, {
        filter: transformNewFilterToOldFilter(filter),
      });
    },
    options
  );
};
