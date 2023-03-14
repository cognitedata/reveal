import { useMemo } from 'react';

import { useSequencesMetadataKeysAggregateQuery } from './useSequenceMetadataKeysAggregateQuery';

export const useSequencesMetadataKeys = () => {
  const { data, ...rest } = useSequencesMetadataKeysAggregateQuery();

  const metadataKeys = useMemo(() => {
    return data?.map(({ value }) => value);
  }, [data]);

  return {
    data: metadataKeys,
    ...rest,
  };
};
