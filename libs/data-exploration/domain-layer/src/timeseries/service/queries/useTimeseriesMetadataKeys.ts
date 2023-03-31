import { useMemo } from 'react';

import { useTimeseriesMetadataKeysAggregateQuery } from './useTimeseriesMetadataKeysAggregateQuery';

interface Props {
  query?: string;
  enabled?: boolean;
}

export const useTimeseriesMetadataKeys = ({ query, enabled }: Props = {}) => {
  const { data, ...rest } = useTimeseriesMetadataKeysAggregateQuery(
    undefined,
    query,
    { enabled }
  );

  const metadataKeys = useMemo(() => {
    return data?.map(({ values }) => values);
  }, [data]);

  return {
    data: metadataKeys,
    ...rest,
  };
};
