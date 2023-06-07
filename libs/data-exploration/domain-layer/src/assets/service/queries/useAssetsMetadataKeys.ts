import { useMemo } from 'react';

import { useAssetsMetadataKeysAggregateQuery } from './useAssetsMetadataKeysAggregateQuery';

interface Props {
  query?: string;
  enabled?: boolean;
}

export const useAssetsMetadataKeys = ({ query, enabled }: Props = {}) => {
  const { data, ...rest } = useAssetsMetadataKeysAggregateQuery({
    query,
    options: { enabled },
  });

  const metadataKeys = useMemo(() => {
    return data?.map(({ values }) => values).flat();
  }, [data]);

  return {
    data: metadataKeys,
    ...rest,
  };
};
