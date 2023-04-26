import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';

import {
  AdvancedFilter,
  getTimeseriesMetadataKeysAggregate,
  queryKeys,
  TimeseriesProperties,
} from '@data-exploration-lib/domain-layer';
import { TimeseriesMetadataAggregateResponse } from '../types';

interface Props {
  query?: string;
  advancedFilter?: AdvancedFilter<TimeseriesProperties>;
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
  options,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.timeseriesMetadata(query, advancedFilter),
    () => {
      return getTimeseriesMetadataKeysAggregate(sdk, {
        advancedFilter,
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    options
  );
};
