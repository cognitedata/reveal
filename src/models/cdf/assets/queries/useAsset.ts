import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';

export const useAsset = (id?: number) => {
  const sdk = useSDK();

  return useQuery({
    queryKey: ['cdf', 'assets', id],
    queryFn: async () => {
      const assets = await sdk.assets.retrieve([{ id: id! }]);
      return assets[0];
    },
    enabled: !!id,
    cacheTime: id ? 60 * 60 * 1000 : 0,
  });
};
