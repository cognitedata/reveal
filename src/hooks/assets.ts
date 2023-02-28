import { Asset, AssetFilterProps, CogniteError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import {
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

const useAssetsKey = (limit: number, filter?: AssetFilterProps): QueryKey => [
  'assets',
  'list',
  { limit, filter },
];

export const useAssets = (
  limit: number,
  filter?: AssetFilterProps,
  opts?: UseInfiniteQueryOptions<
    { items: Asset[]; nextPage?: string },
    CogniteError
  >
) => {
  const sdk = useSDK();
  return useInfiniteQuery(
    useAssetsKey(limit, filter),
    ({ pageParam }) => sdk.assets.list({ cursor: pageParam, filter, limit }),
    {
      getNextPageParam(lastPage) {
        return lastPage.nextPage;
      },
      ...opts,
    }
  );
};

const useAssetSearchKey = (
  query: string,
  filter?: AssetFilterProps
): QueryKey => ['assets', 'search', query, { filter }];

export const useAssetSearch = <T>(
  query: string,
  opts?: UseQueryOptions<Asset[], CogniteError, T>
) => {
  const sdk = useSDK();
  return useQuery(
    useAssetSearchKey(query),
    () => sdk.assets.search({ search: { query }, limit: 1000 }),

    opts
  );
};
