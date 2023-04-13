import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { Asset } from '@cognite/sdk';

export const useAsset = (id?: number) => {
  const sdk = useSDK();

  return useQuery<Asset | undefined>(
    ['asset', id],
    async () => {
      if (id === undefined) {
        return undefined;
      }

      const assets = await sdk.assets.retrieve([{ id }]);
      return assets[0];
    },
    { enabled: !!id }
  );
};
