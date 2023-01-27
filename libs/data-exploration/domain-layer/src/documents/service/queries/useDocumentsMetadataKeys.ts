import { useMemo } from 'react';
import { useDocumentsMetadataKeysAggregateQuery } from './useDocumentsMetadataKeysAggregateQuery';

export const useDocumentsMetadataKeys = () => {
  const { data, ...rest } = useDocumentsMetadataKeysAggregateQuery();

  const metadataKeys = useMemo(() => {
    return data?.map(({ value }) => value);
  }, [data]);

  return { data: metadataKeys, ...rest };
};
