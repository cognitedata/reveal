import { useSDK } from '@cognite/sdk-provider';
import { Timeseries } from '@cognite/sdk';
import { useQuery } from 'react-query';

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
