import { useMemo } from 'react';

import { useSequencesMetadataKeysAggregateQuery } from './useSequenceMetadataKeysAggregateQuery';

interface Props {
  query?: string;
  enabled?: boolean;
}

export const useSequencesMetadataKeys = ({ query }: Props = {}) => {
  const { data, ...rest } = useSequencesMetadataKeysAggregateQuery({
    query,
  });

  const metadataKeys = useMemo(() => {
    return data?.map(({ value }) => value);
  }, [data]);

  return {
    data: metadataKeys,
    ...rest,
  };
};
