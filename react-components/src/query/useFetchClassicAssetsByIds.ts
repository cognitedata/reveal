import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { type InternalId, type Asset } from '@cognite/sdk';
import { createContext, useContext } from 'react';
import { chunk } from 'lodash';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { type AllAssetFilterProps } from '../query/network/common/filters';
import { executeParallel } from '../utilities/executeParallel';
import { queryKeys } from '../utilities/queryKeys';
import { MAX_PARALLEL_QUERIES } from '../data-providers/utils/getDMSModelRevisionRefs';

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

export const useFetchClassicAssetsByIds = (
  assetIdsToFilter: InternalId[],
  filter?: AllAssetFilterProps
): UseQueryResult<Asset[], undefined> => {
  const { useSDK } = useContext(UseFetchAllClassicAssetsContext);
  const sdk = useSDK();
  return useQuery({
    queryKey: queryKeys.assetsById(assetIdsToFilter),
    queryFn: async () => {
      const assetIdsChunk = chunk(assetIdsToFilter, MAX_LIMIT_ASSETS_BY_LIST_WITH_IDS);
      const assets = await executeParallel(
        assetIdsChunk.map((chunkIds) => async () => {
          const filters: AllAssetFilterProps = filter ?? defaultFilter(chunkIds);
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

function defaultFilter(ids: InternalId[]): AllAssetFilterProps {
  return {
    advancedFilter: {
      or: [
        {
          in: {
            property: 'id',
            values: ids.map((id) => id.id)
          }
        }
      ]
    },
    filter: {}
  };
}
