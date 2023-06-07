import { useQuery } from '@tanstack/react-query';

import { Timeseries } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export const useAssetTimeseries = (assetId?: number) => {
  const sdk = useSDK();

  return useQuery<Timeseries[]>(
    ['timeseries', 'assetIds', assetId],
    async () => {
      if (assetId === undefined) {
        return [];
      }

      const timeseries = await sdk.timeseries.list({
        filter: { assetIds: [assetId] },
      });

      return timeseries.items;
    },
    { enabled: !!assetId }
  );
};
