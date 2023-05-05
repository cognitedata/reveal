import { useMemo } from 'react';

import { useEventsMetadataKeysAggregateQuery } from './useEventsMetadataKeysAggregateQuery';

interface Props {
  query?: string;
  enabled?: boolean;
}

export const useEventsMetadataKeys = ({ query, enabled }: Props = {}) => {
  const { data, ...rest } = useEventsMetadataKeysAggregateQuery({
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
