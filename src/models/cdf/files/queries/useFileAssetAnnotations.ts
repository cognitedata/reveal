import { FileInfo as File } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { listAnnotationsForFile } from '@cognite/annotations';

export const useFileAssetAnnotations = (file?: File) => {
  const sdk = useSDK();

  return useQuery({
    queryKey: ['cdf', 'files', file?.id, 'annotations'],
    queryFn: async () => {
      const annotations = await listAnnotationsForFile(sdk, file!);
      return annotations.filter((a) => a.resourceType === 'asset');
    },
    enabled: !!file?.id,
    retry: false,
    cacheTime: file?.id ? 6 * 60 * 60 * 1000 : 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};
