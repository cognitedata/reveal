import { useSDK } from '@cognite/sdk-provider';
import { FileInfo } from '@cognite/sdk/dist/src';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../queryKeys';
import { getFileBySiteId } from '../network';

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
