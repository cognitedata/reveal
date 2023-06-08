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
      return getFileIcon(sdk, file!.id);
    },
    {
      enabled: file !== undefined && isFileOfType(file, VALID_IMAGE_TYPES),
      retry: false,
      staleTime: Infinity,
    }
  );
};
