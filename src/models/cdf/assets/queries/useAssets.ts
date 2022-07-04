import { useSDK } from '@cognite/sdk-provider';
import { CogniteInternalId } from '@cognite/sdk';
import { useQuery } from 'react-query';
import useSimpleMemo from 'hooks/useSimpleMemo';

export default function useAssets(assetIds: CogniteInternalId[]) {
  const sdk = useSDK();
  const memoizedAssetIds = useSimpleMemo(assetIds);

  return useQuery({
    queryKey: ['cdf', 'assets', 'list', ...assetIds],
    queryFn: () => sdk.assets.retrieve(memoizedAssetIds.map((id) => ({ id }))),
    enabled: assetIds.length > 0,
    retry: false,
    cacheTime: assetIds.length > 0 ? 6 * 60 * 60 * 1000 : 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
