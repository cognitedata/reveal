import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import { InternalSequenceFilters, OldSequenceFilters } from '../../internal';
import {
  getSequencesMetadataKeysAggregate,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import { SequencesMetadataAggregateResponse } from '../types';

export const useSequencesMetadataKeysAggregateQuery = (
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
    queryKeys.sequencesMetadata(filter),
    () => {
      return getSequencesMetadataKeysAggregate(sdk, {
        filter: transformNewFilterToOldFilter(filter),
      });
    },
    options
  );
};
