import { Asset } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { listFilesAnnotatedWithAssetId } from '@cognite/annotations';
import unionBy from 'lodash/unionBy';

const useAssetAnnotatedFiles = (asset?: Asset, enabled = true) => {
  const sdk = useSDK();

  return useQuery({
    queryKey: ['cdf', 'assets', asset?.id, 'annotatedFiles'],
    queryFn: async () => {
      const annotatedFiles = await listFilesAnnotatedWithAssetId(sdk, asset!);

      const linkedSvgs = await sdk.files.list({
        filter: { assetIds: [asset?.id!], mimeType: 'image/svg+xml' },
      });
      const linkedPdfs = await sdk.files.list({
        filter: { assetIds: [asset?.id!], mimeType: 'application/pdf' },
      });

      return unionBy(
        annotatedFiles,
        [...linkedSvgs.items, ...linkedPdfs.items],
        'id'
      );
    },
    enabled: !!asset && enabled,
    retry: false,
    cacheTime: asset?.id ? 6 * 60 * 60 * 1000 : 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

export default useAssetAnnotatedFiles;
