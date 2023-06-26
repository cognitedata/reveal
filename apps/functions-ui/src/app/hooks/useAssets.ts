import { getCogniteSDKClient } from '@functions-ui/cogniteSdk';
import { useQuery } from '@tanstack/react-query';

export const useAssets = () => {
  return useQuery(['assets'], async () => {
    const sdk = getCogniteSDKClient();
    const assets = await sdk.assets.list();
    return assets;
  });
};
