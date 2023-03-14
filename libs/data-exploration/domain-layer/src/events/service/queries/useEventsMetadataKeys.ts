import { useMemo } from 'react';

import { useEventsMetadataKeysAggregateQuery } from './useEventsMetadataKeysAggregateQuery';

export const useEventsMetadataKeys = () => {
  const { data, ...rest } = useEventsMetadataKeysAggregateQuery();

  const metadataKeys = useMemo(() => {
    return data?.map(({ value }) => value);
  }, [data]);

  return {
    data: metadataKeys,
    ...rest,
  };
};
