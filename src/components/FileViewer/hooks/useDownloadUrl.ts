import { useSDK } from '@cognite/sdk-provider';
import { FileInfo } from '@cognite/sdk';
import { useQuery } from 'react-query';
import { baseCacheKey } from '@cognite/sdk-react-query-hooks';

export const useDownloadUrl = (file?: FileInfo) => {
  const sdk = useSDK();
  const { id: fileId } = file || {};
  const { data } = useQuery(
    [...baseCacheKey('files'), 'downloadLink', fileId],
    () =>
      fileId
        ? sdk.files.getDownloadUrls([{ id: fileId }]).then((r) => r[0])
        : undefined,
    // The retrieved URL becomes invalid after 30 seconds
    { refetchInterval: 25000 }
  );

  return data?.downloadUrl || '';
};
