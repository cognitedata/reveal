import { useQuery } from '@tanstack/react-query';

import { Asset } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

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
