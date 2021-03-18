import { useSDK } from '@cognite/sdk-provider';
import { Asset, IdEither } from '@cognite/sdk';
import { useQuery } from 'react-query';

export const useAssets = (ids: IdEither[]) => {
  const sdk = useSDK();

  return useQuery<Asset[]>(['assets', ids], async () => {
    return sdk.assets.retrieve(ids);
  });
};
