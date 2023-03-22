import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { Asset } from '@cognite/sdk';

export const useAsset = (id?: number) => {
  const sdk = useSDK();

  return useQuery<Asset>(
    ['asset', id],
    async () => {
      const assets = await sdk.assets.retrieve([{ id: id! }]);
      return assets[0];
    },
    { enabled: !!id }
  );
};
