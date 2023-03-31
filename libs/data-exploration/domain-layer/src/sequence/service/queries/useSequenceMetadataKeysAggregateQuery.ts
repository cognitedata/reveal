import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  getSequencesMetadataKeysAggregate,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import { SequencesMetadataAggregateResponse } from '../types';
import {
  InternalSequenceFilters,
  OldSequenceFilters,
} from '@data-exploration-lib/core';

export const useSequencesMetadataKeysAggregateQuery = (
  query?: string,
  filter?: InternalSequenceFilters | OldSequenceFilters,
  options?: UseQueryOptions<
    SequencesMetadataAggregateResponse[],
    unknown,
    SequencesMetadataAggregateResponse[],
    any
  >
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.sequencesMetadata(query, filter),
    () => {
      return getSequencesMetadataKeysAggregate(sdk, {
        filter: transformNewFilterToOldFilter(filter),
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    options
  );
};
