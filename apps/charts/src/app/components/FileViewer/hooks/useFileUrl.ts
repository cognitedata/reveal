import { useQuery } from '@tanstack/react-query';

import { FileInfo } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { baseCacheKey } from '@cognite/sdk-react-query-hooks';

import { FILE_URL_REFETCH_INTERVAL } from '../constants';

export const useFileUrl = (
  file?: FileInfo
): { fileUrl: string | undefined } => {
  const sdk = useSDK();
  const { id: fileId } = file || {};

  const { data } = useQuery(
    [...baseCacheKey('files'), 'downloadLink', fileId],
    () =>
      // @ts-ignore query is enabled only when fileId is present
      sdk.files.getDownloadUrls([{ id: fileId }]).then((results) => results[0]),
    { refetchInterval: FILE_URL_REFETCH_INTERVAL, enabled: Boolean(fileId) }
  );

  if (!fileId) {
    return { fileUrl: undefined };
  }

  return { fileUrl: data?.downloadUrl };
};
