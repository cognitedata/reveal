import { CogniteInternalId } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useQueries } from 'react-query';

export default function useAssetsTimeseries(assetIds: CogniteInternalId[]) {
  const sdk = useSDK();

  return useQueries(
    assetIds.map((assetId) => ({
      queryKey: ['cdf', 'assets', assetId, 'timeseries'],
      queryFn: async () => ({
        list: await sdk.timeseries.list({ filter: { assetIds }, limit: 10 }),
        total: await sdk.timeseries.aggregate({
          filter: { assetIds: [assetId] },
        }),
      }),
      enabled: !!assetId,
      staleTime: 60 * 60 * 1000,
    }))
  );
}
