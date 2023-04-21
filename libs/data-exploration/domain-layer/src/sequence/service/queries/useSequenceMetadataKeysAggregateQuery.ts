import { useQuery } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AdvancedFilter,
  getSequencesMetadataKeysAggregate,
  queryKeys,
  SequenceProperties,
} from '@data-exploration-lib/domain-layer';

interface Props {
  prefix?: string;
  advancedFilter?: AdvancedFilter<SequenceProperties>;
}

export const useSequencesMetadataKeysAggregateQuery = ({
  prefix,
  advancedFilter,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.sequencesMetadata(prefix, advancedFilter),
    () => {
      return getSequencesMetadataKeysAggregate(sdk, {
        advancedFilter,
        aggregateFilter: prefix ? { prefix: { value: prefix } } : undefined,
      });
    },
    {
      keepPreviousData: true,
    }
  );
};
