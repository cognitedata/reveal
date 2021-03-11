import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';

export const useAssetTimeseresSearch = (
  query: string,
  includeMissingTS: boolean = false
) => {
  const sdk = useSDK();
  return useQuery(
    ['search', query],
    async () => {
      const assets = await sdk.assets.search({ search: { query }, limit: 25 });
      if (assets.length === 0) {
        return [];
      }
      const timeseries = await sdk.timeseries.list({
        filter: { assetIds: assets.map((a) => a.id) },
      });

      return assets
        .map((asset) => ({
          asset,
          ts: timeseries.items.filter((ts) => ts.assetId === asset.id),
        }))
        .filter(({ ts }) => includeMissingTS || ts.length > 0);
    },
    { enabled: query.length > 0 }
  );
};
