import { useMemo } from 'react';

import { useTimeseriesMetadataKeysAggregateQuery } from './useTimeseriesMetadataKeysAggregateQuery';

export const useTimeseriesMetadataKeys = () => {
  const { data, ...rest } = useTimeseriesMetadataKeysAggregateQuery();

  const metadataKeys = useMemo(() => {
    return data?.map(({ values }) => values);
  }, [data]);

  return {
    data: metadataKeys,
    ...rest,
  };
};
