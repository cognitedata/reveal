import { useSDK } from '@cognite/sdk-provider';
import { FileInfo } from '@cognite/sdk/dist/src';
import { fetchFilePreviewURL } from '@data-exploration-lib/core';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../queryKeys';
import { InternalDocument } from '../types';

export const useFilePreviewURL = (file: FileInfo | InternalDocument) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.filePreviewURL(file.id),
    () => fetchFilePreviewURL(sdk, file),
    {
      retry: false,
      cacheTime: 1000,
      refetchOnWindowFocus: false,
    }
  );
};
