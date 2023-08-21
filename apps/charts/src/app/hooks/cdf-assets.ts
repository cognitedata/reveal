import { useQuery } from '@tanstack/react-query';

import { Asset, Timeseries } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useCdfItem, useList } from '@cognite/sdk-react-query-hooks';

export const useAsset = (id?: number) => {
  return useCdfItem<Asset>(
    'assets',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore will not be undefined as this query is enabled only when id is Finite Number
    { id },
    {
      enabled: Number.isFinite(id),
    }
  );
};

export const useAssetList = (name?: string) => {
  return useList<Asset>(
    'assets',
    { filter: { name } },
    {
      enabled: Boolean(name),
    }
  );
};

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

export const useRootTimeseries = () => {
  const sdk = useSDK();

  return useQuery<Timeseries[]>(
    ['timeseries', 'root'],
    async () => {
      const timeseries = await sdk.timeseries.list();

      return timeseries.items;
    },
    { enabled: true }
  );
};

export const useAssetTimeseries = (assetId?: number) => {
  return useList<Timeseries>(
    'timeseries',
    {
      filter: { assetIds: [assetId!] },
    },
    {
      enabled: Boolean(assetId),
    }
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
        return null;
      }

      const { assetId } = timeseries[0];

      if (!assetId) {
        return null;
      }

      const assets = await sdk.assets.retrieve([{ id: assetId }]);
      return assets[0];
    },
    { enabled: enabled && !!timeseriesExternalId }
  );
};

export const useCdfEvent = (eventId?: number, enabled = true) => {
  const sdk = useSDK();

  return useQuery(
    ['event', 'eventId', eventId],
    async () => {
      const event = await sdk.events.retrieve([{ id: eventId! }]);

      if (!event.length) {
        return null;
      }

      return event[0];
    },
    { enabled: enabled && !!eventId }
  );
};
