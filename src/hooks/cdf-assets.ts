import { useSDK } from '@cognite/sdk-provider';
import { Asset, Timeseries } from '@cognite/sdk';
import { useQuery } from 'react-query';

export const useRootAssets = () => {
  const sdk = useSDK();

  return useQuery<Asset[]>(
    ['assets', 'root'],
    async () => {
      const assets = await sdk.assets.list({ filter: { root: true } });
      const filteredAssets = assets.items.filter(
        (asset) => asset.name !== 'AIR'
      );
      return filteredAssets;
    },
    { enabled: true }
  );
};

export const useAssetTimeseries = (assetId?: number) => {
  const sdk = useSDK();

  return useQuery<Timeseries[]>(
    ['timeseries', 'assetIds', assetId],
    async () => {
      const timeseries = await sdk.timeseries.list({
        filter: { assetIds: [assetId!] },
      });

      return timeseries.items;
    },
    { enabled: !!assetId }
  );
};

export const useLinkedAsset = (
  timeseriesExternalId?: string,
  enabled = true
) => {
  const sdk = useSDK();

  return useQuery(
    ['assets', 'timeseriesId', timeseriesExternalId],
    async () => {
      const timeseries = await sdk.timeseries.retrieve([
        { externalId: timeseriesExternalId! },
      ]);

      if (timeseries.length === 0) {
        return undefined;
      }

      const { assetId } = timeseries[0];

      if (!assetId) {
        return undefined;
      }

      const assets = await sdk.assets.retrieve([{ id: assetId }]);
      return assets[0];
    },
    { enabled: enabled && !!timeseriesExternalId }
  );
};
