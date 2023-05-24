import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@data-exploration-lib/domain-layer';
import { getFileCountAggregateBySiteId } from '@data-exploration-lib/domain-layer';

export const useFilesAggregateBySiteId = (siteId?: string, face?: string) => {
  const sdk = useSDK();

  return useQuery<number | undefined>(
    queryKeys.filesAggregateBySiteId(siteId),
    () => {
      if (!siteId) {
        return undefined;
      }
      return getFileCountAggregateBySiteId(sdk, siteId, face);
    },
    { enabled: !!siteId }
  );
};
