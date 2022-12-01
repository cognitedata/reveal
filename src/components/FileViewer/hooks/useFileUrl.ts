import { useSDK } from '@cognite/sdk-provider';
import { FileInfo } from '@cognite/sdk';
import { baseCacheKey } from '@cognite/sdk-react-query-hooks';
import { useQuery } from 'react-query';
import { FILE_URL_REFETCH_INTERVAL } from '../constants';

export const useFileUrl = (
  file?: FileInfo
): { fileUrl: string | undefined } => {
  const sdk = useSDK();
  const { id: fileId } = file || {};

  if (!fileId) {
    return { fileUrl: undefined };
  }

  const { data } = useQuery(
    [...baseCacheKey('files'), 'downloadLink', fileId],
    () =>
      sdk.files.getDownloadUrls([{ id: fileId }]).then((results) => results[0]),
    { refetchInterval: FILE_URL_REFETCH_INTERVAL, enabled: !!fileId }
  );

  return { fileUrl: data?.downloadUrl };
};
