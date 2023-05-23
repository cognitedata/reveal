import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { FileInfo } from '@cognite/sdk/dist/src';
import { isFileOfType } from '@data-exploration-lib/core';
import {
  getFileIcon,
  queryKeys,
  VALID_IMAGE_TYPES,
} from '@data-exploration-lib/domain-layer';

export const useFileIconQuery = (file: FileInfo | undefined) => {
  const sdk = useSDK();

  return useQuery<ArrayBuffer | undefined>(
    queryKeys.fileIconQuery(file),
    () => {
      if (!file) {
        return undefined;
      }
      if (isFileOfType(file, VALID_IMAGE_TYPES)) {
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
