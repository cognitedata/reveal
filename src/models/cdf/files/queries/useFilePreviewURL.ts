import { FileInfo as File } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import fetchFilePreviewURL from '../services/fetchFilePreviewURL';

export const useFilePreviewURL = (file: File) => {
  const sdk = useSDK();

  return useQuery(
    ['cdf', 'files', file.id, 'previewURL'],
    () => fetchFilePreviewURL(sdk, file),
    {
      retry: false,
      cacheTime: 6 * 60 * 60 * 1000,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    }
  );
};
