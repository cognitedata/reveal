import { useQuery } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AdvancedFilter,
  getSequencesMetadataKeysAggregate,
  queryKeys,
  SequenceProperties,
} from '@data-exploration-lib/domain-layer';

interface Props {
  query?: string;
  advancedFilter?: AdvancedFilter<SequenceProperties>;
}

export const useSequencesMetadataKeysAggregateQuery = ({
  query,
  advancedFilter,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.sequencesMetadata(query, advancedFilter),
    () => {
      return getSequencesMetadataKeysAggregate(sdk, {
        advancedFilter,
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      keepPreviousData: true,
    }
  );
};
