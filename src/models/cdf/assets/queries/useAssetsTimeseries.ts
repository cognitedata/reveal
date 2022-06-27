import { Asset } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import useSimpleMemo from 'hooks/useSimpleMemo';
import { useQueries } from 'react-query';

export default function useAssetsTimeseries(assets: Asset[]) {
  const sdk = useSDK();

  const assetIds = useSimpleMemo(assets.map(({ id }) => id));

  return useQueries(
    assetIds.map((assetId) => ({
      queryKey: ['cdf', 'assets', assetId, 'timeseries'],
      queryFn: async () => ({
        list: (
          await sdk.timeseries.list({
            filter: { assetIds: [assetId] },
            limit: 10,
          })
        ).items,
        total: (
          await sdk.timeseries.aggregate({
            filter: { assetIds: [assetId] },
          })
        )[0].count,
      }),
      enabled: !!assetId,
      staleTime: 60 * 60 * 1000,
      refetchOnWindowFocus: false,
    }))
  );
}
