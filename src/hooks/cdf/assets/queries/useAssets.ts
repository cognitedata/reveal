import { useSDK } from '@cognite/sdk-provider';
import { CogniteInternalId } from '@cognite/sdk';
import { useQuery } from 'react-query';

export default function useAssets(assetIds: CogniteInternalId[]) {
  const sdk = useSDK();

  return useQuery({
    queryKey: ['cdf', 'assets', 'list', ...assetIds],
    queryFn: () => sdk.assets.retrieve(assetIds.map((id) => ({ id }))),
    enabled: assetIds.length > 0,
    refetchOnWindowFocus: false,
  });
}
