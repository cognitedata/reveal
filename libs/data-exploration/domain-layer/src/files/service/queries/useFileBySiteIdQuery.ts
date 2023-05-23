import { useSDK } from '@cognite/sdk-provider';
import { FileInfo } from '@cognite/sdk/dist/src';
import { getFileBySiteId, queryKeys } from '@data-exploration-lib/domain-layer';
import { useQuery } from 'react-query';

export const useFileBySiteIdQuery = (siteId: string | undefined) => {
  const sdk = useSDK();

  return useQuery<FileInfo | undefined>(
    queryKeys.fileBySiteId(siteId),
    () => {
      if (!siteId) {
        return undefined;
      }
      return getFileBySiteId(sdk, siteId, 'front');
    },
    { enabled: !!siteId }
  );
};
