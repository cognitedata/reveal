import { useQuery } from '@tanstack/react-query';
import { getCogniteSDKClient } from '../../cogniteSdk';

export const useAssets = () => {
  return useQuery(['assets'], async () => {
    const sdk = getCogniteSDKClient();
    const assets = await sdk.assets.list();
    return assets;
  });
};
