import { useMemo } from 'react';
import { useDocumentsMetadataKeysAggregateQuery } from './useDocumentsMetadataKeysAggregateQuery';

interface Props {
  query?: string;
  enabled?: boolean;
}

export const useDocumentsMetadataKeys = ({ query, enabled }: Props = {}) => {
  const { data, ...rest } = useDocumentsMetadataKeysAggregateQuery({
    prefix: query,
    options: { enabled },
  });

  const metadataKeys = useMemo(() => {
    return data?.map(({ value }) => value);
  }, [data]);

  return { data: metadataKeys, ...rest };
};
