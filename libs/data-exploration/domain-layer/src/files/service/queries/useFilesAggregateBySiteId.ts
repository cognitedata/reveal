import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../queryKeys';
import { getFileCountAggregateBySiteId } from '../network';

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
