import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { InternalSequenceFilters } from '@data-exploration-lib/core';

import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { transformNewFilterToOldFilter } from '../../../transformers';
import { SequenceProperties } from '../../internal';
import { getSequencesMetadataKeysAggregate } from '../network';

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
