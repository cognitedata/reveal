import { useQuery } from '@tanstack/react-query';

import { FileInfo } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

import { isFileOfType } from '@data-exploration-lib/core';

import { VALID_IMAGE_TYPES } from '../../../constants';
import { queryKeys } from '../../../queryKeys';
import { getFileIcon } from '../network';

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
