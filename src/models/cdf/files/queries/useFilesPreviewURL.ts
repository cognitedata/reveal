import { useSDK } from '@cognite/sdk-provider';
import { FileInfo } from '@cognite/sdk';
import useSimpleMemo from 'hooks/useSimpleMemo';
import { useQueries } from 'react-query';
import fetchFilePreviewURL from '../services/fetchFilePreviewURL';

export default function useFilesPreviewURL(files: FileInfo[]) {
  const sdk = useSDK();
  const memoizedFiles = useSimpleMemo(files);
  return useQueries(
    memoizedFiles.map((file) => ({
      queryKey: ['cdf', 'files', file.id, 'previewURL'],
      queryFn: () => fetchFilePreviewURL(sdk, file),
      retry: false,
      cacheTime: 6 * 60 * 60 * 1000,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    }))
  );
}
