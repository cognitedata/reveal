import { useMemo } from 'react';

import { useTimeseriesMetadataKeysAggregateQuery } from './useTimeseriesMetadataKeysAggregateQuery';

export const useTimeseriesMetadataKeys = () => {
  const { data, ...rest } = useTimeseriesMetadataKeysAggregateQuery();

  const metadataKeys = useMemo(() => {
    return data?.map(({ value }) => value);
  }, [data]);

  return {
    data: metadataKeys,
    ...rest,
  };
};
