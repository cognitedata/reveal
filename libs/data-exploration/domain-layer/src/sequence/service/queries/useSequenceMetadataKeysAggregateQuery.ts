import { useQuery } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AdvancedFilter,
  getSequencesMetadataKeysAggregate,
  queryKeys,
  SequenceProperties,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import { InternalSequenceFilters } from '@data-exploration-lib/core';

interface Props {
  query?: string;
  advancedFilter?: AdvancedFilter<SequenceProperties>;
  filter?: InternalSequenceFilters;
}

export const useSequencesMetadataKeysAggregateQuery = ({
  query,
  advancedFilter,
  filter,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.sequencesMetadata(query, advancedFilter, filter),
    () => {
      return getSequencesMetadataKeysAggregate(sdk, {
        advancedFilter,
        filter: transformNewFilterToOldFilter(filter),
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      keepPreviousData: true,
    }
  );
};
