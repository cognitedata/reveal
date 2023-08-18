import { useCallback } from 'react';

import { useLabelsNameMap } from './useLabelsNameMap';

export const useGetLabelName = (): ((externalId: string) => string) => {
  const labelsNameMap = useLabelsNameMap();

  return useCallback(
    (externalId: string, fallback?: string) => {
      const labelName = labelsNameMap[externalId];

      if (labelName) {
        return `${labelName} (${externalId})`;
      }

      return fallback || externalId;
    },
    [labelsNameMap]
  );
};
