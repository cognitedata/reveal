import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useSDK } from '../../RevealCanvas/SDKProvider';
import { type InternalId, type Asset } from '@cognite/sdk';
import { queryKeys } from '../../../utilities/queryKeys';
import { createContext, useContext } from 'react';
import { type AllAssetFilterProps } from '../../../query/network/common/filters';
import { chunk } from 'lodash';
import { executeParallel } from '../../../utilities/executeParallel';
import { MAX_PARALLEL_QUERIES } from '../../../data-providers/utils/getDMSModelRevisionRefs';

export type UseFetchAllClassicAssetsDependencies = {
  useSDK: typeof useSDK;
};

export const defaultUseFetchAllClassicAssetsDependencies = {
  useSDK
};

export const UseFetchAllClassicAssetsContext = createContext<UseFetchAllClassicAssetsDependencies>(
  defaultUseFetchAllClassicAssetsDependencies
);

const MAX_LIMIT_ASSETS_BY_LIST_WITH_IDS = 100;

export const useFetchClassicAssets = (
  assetIdsToFilter: InternalId[]
): UseQueryResult<Asset[], undefined> => {
  const { useSDK } = useContext(UseFetchAllClassicAssetsContext);
  const sdk = useSDK();
  return useQuery({
    queryKey: queryKeys.assetsById(assetIdsToFilter),
    queryFn: async () => {
      const assetIdsChunk = chunk(assetIdsToFilter, MAX_LIMIT_ASSETS_BY_LIST_WITH_IDS);
      const assets = await executeParallel(
        assetIdsChunk.map((chunkIds) => async () => {
          const filters: AllAssetFilterProps = {
            advancedFilter: {
              or: [
                {
                  in: {
                    property: 'id',
                    values: chunkIds.map((id) => id.id)
                  }
                }
              ]
            },
            filter: {}
          };
          const { items } = await sdk.assets.list({
            limit: MAX_LIMIT_ASSETS_BY_LIST_WITH_IDS,
            ...filters
          });
          return items;
        }),
        MAX_PARALLEL_QUERIES
      );
      return assets.filter((asset) => asset !== undefined).flat();
    },
    staleTime: Infinity
  });
};
