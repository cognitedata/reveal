import { useMemo } from 'react';

import { useAllLabelsQuery } from '../../service';

export const useLabelsNameMap = (): Record<string, string> => {
  const { data = [] } = useAllLabelsQuery();

  return useMemo(() => {
    const labelsNameMap = new Map<string, string>();

    data.forEach(({ externalId, name }) => {
      labelsNameMap.set(externalId, name);
    });

    return Object.fromEntries(labelsNameMap);
  }, [data]);
};
