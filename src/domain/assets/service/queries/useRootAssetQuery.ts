import { useSDK } from '@cognite/sdk-provider';
import { queryKeys } from 'domain/queryKeys';
import { useQuery } from 'react-query';
import { getRootAsset } from '../network/getRootAsset';

export const useRootAssetQuery = (assetId: number) => {
  const sdk = useSDK();

  return useQuery(queryKeys.rootAsset(assetId), () => {
    return getRootAsset(sdk, assetId);
  });
};
