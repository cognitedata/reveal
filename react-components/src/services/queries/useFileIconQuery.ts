import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { FileInfo } from '@cognite/sdk';
import { isFileOfType } from '../utils/files';
import { getFileIcon } from '../network/getFileIcon';

export const useFileIconQuery = (file: FileInfo | undefined) => {
  const sdk = useSDK();

  return useQuery<ArrayBuffer | undefined>(
    ['cdf', '360image', 'icon', file?.id],
    () => {
      if (!file) {
        return undefined;
      }
      if (isFileOfType(file, ['png', 'jpg', 'jpeg', 'tiff', 'gif'])) {
        return getFileIcon(sdk, file.id);
      }
      return undefined;
    },
    {
      retry: false,
      staleTime: Infinity,
    }
  );
};
