import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useSDK } from '../../RevealCanvas/SDKProvider';
import { type Asset } from '@cognite/sdk';
import { queryKeys } from '../../../utilities/queryKeys';
import { createContext, useContext } from 'react';

export type UseFetchAllClassicAssetsDependencies = {
  useSDK: typeof useSDK;
};

export const defaultUseFetchAllClassicAssetsDependencies = {
  useSDK
};

export const UseFetchAllClassicAssetsContext = createContext<UseFetchAllClassicAssetsDependencies>(
  defaultUseFetchAllClassicAssetsDependencies
);

export const useFetchAllClassicAssets = (): UseQueryResult<Asset[], undefined> => {
  const { useSDK } = useContext(UseFetchAllClassicAssetsContext);
  const sdk = useSDK();
  return useQuery({
    queryKey: queryKeys.allClassicAssets(),
    queryFn: async () => {
      let cursor: string | undefined;
      let assets: Asset[] = [];
      do {
        const { items, nextCursor } = await sdk.assets.list({
          limit: 1000,
          cursor,
          filter: { root: false }
        });
        cursor = nextCursor;
        assets = assets.concat(items);
      } while (cursor !== undefined);
      return assets;
    },
    staleTime: Infinity
  });
}
