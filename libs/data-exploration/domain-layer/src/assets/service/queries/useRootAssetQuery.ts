import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { getRootAsset } from '../network/getRootAsset';

export const useRootAssetQuery = (assetId?: number) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.rootAsset(assetId!),
    () => {
      return getRootAsset(sdk, assetId!);
    },
    {
      enabled: Boolean(assetId),
    }
  );
};
