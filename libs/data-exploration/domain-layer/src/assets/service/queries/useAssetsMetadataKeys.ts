import { useMemo } from 'react';

import { useAssetsMetadataKeysAggregateQuery } from './useAssetsMetadataKeysAggregateQuery';

export const useAssetsMetadataKeys = () => {
  const { data, ...rest } = useAssetsMetadataKeysAggregateQuery();

  const metadataKeys = useMemo(() => {
    return data?.map(({ value }) => value);
  }, [data]);

  return {
    data: metadataKeys,
    ...rest,
  };
};
