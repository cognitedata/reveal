import { AssetFilterProps, Asset } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import {
  useSearch,
  useList,
  retrieveItemsKey,
  listKey,
  listApi,
} from '@cognite/sdk-react-query-hooks';
import { QueryKey, useQueryCache, useQuery, QueryConfig } from 'react-query';

export const useSearchTree = (
  filter: AssetFilterProps,
  query?: string,
  config?: QueryConfig<Asset[]>
) => {
  const sdk = useSDK();
  const cache = useQueryCache();
  const enableSearch = !!query;

  const {
    data: searchData = [],
    isFetched: searchFeched,
    isFetching: searchFetching,
    error: searchError,
    isError: searchIsError,
  } = useSearch<Asset>(
    'assets',
    query as string,
    {
      limit: 1000,
      filter: Object.keys(filter || {}).length > 0 ? filter : undefined,
    },
    { ...config, enabled: enableSearch && config?.enabled !== false }
  );

  const {
    data: listData = [],
    isFetched: listFeched,
    isFetching: listFetching,
    error: listError,
    isError: listIsError,
  } = useList<Asset>(
    'assets',
    {
      limit: 1000,
      filter: Object.keys(filter || {}).length > 0 ? filter : undefined,
    },
    { ...config, enabled: !enableSearch && config?.enabled !== false }
  );

  const data = enableSearch ? searchData : listData;
  const isFetched = enableSearch ? searchFeched : listFeched;
  const isFetching = enableSearch ? searchFetching : listFetching;
  const error = enableSearch ? searchError : listError;
  const isError = enableSearch ? searchIsError : listIsError;

  const enabled = isFetched;

  const fetchAndBuildTree = async () => {
    const rootAssets: number[] = [];
    const assetsMap: {
      [key in number]: Asset;
    } = {};
    const assetsChildrenMap: {
      [key in number]: number[];
    } = {};

    const parentIds = new Set<number>();

    const processItems = (el: Asset) => {
      assetsMap[el.id] = el;
      if (el.parentId) {
        if (!assetsChildrenMap[el.parentId]) {
          assetsChildrenMap[el.parentId] = [];
        }
        if (!assetsChildrenMap[el.parentId].includes(el.id)) {
          assetsChildrenMap[el.parentId].push(el.id);
        }
        if (!assetsMap[el.parentId]) {
          parentIds.add(el.parentId);
        }
      } else if (!rootAssets.some(id => id === el.id)) {
        rootAssets.push(el.id);
      }
    };
    data.forEach(processItems);

    while (parentIds.size !== 0) {
      const parentIdsList = [...parentIds].map(id => ({ id }));
      // eslint-disable-next-line no-await-in-loop
      const items = await cache.fetchQuery(
        retrieveItemsKey('assets', parentIdsList),
        () => sdk.assets.retrieve(parentIdsList),
        {
          staleTime: 60 * 1000,
        }
      );

      parentIds.clear();

      items.forEach(processItems);
    }
    return constructTree(rootAssets, assetsChildrenMap, assetsMap);
  };
  const treeResult = useQuery<(Asset & { children?: Asset[] })[]>(
    ['asset-search-tree', query, filter],
    fetchAndBuildTree,
    { enabled }
  );

  return {
    ...treeResult,
    isFetching: treeResult.isFetching || isFetching,
    isFetched: treeResult.isFetched && isFetched,
    isError: treeResult.isError || isError,
    error: treeResult.error || error,
  };
};

export const useRootTree = (
  openIds: number[] = [],
  config?: QueryConfig<Asset[]>
) => {
  const sdk = useSDK();
  const cache = useQueryCache();

  const { data: rootAssets = [] } = useList<Asset>(
    'assets',
    {
      limit: 1000,
      filter: { root: true },
      aggregatedProperties: ['childCount'],
    },
    {
      staleTime: Infinity,
      ...config,
    }
  );

  return useQuery<(Asset & { children?: Asset[] })[]>(
    ['asset-list-tree', openIds],
    async (_: QueryKey, ids: number[]) => {
      const rootAssetIds: number[] = rootAssets.map(el => el.id);
      const assetsChildrenMap: {
        [key in number]: number[];
      } = {};

      const assetsMap = rootAssets.reduce(
        (prev, el) => {
          prev[el.id] = {
            ...el,
            children:
              el.aggregates &&
              el.aggregates.childCount &&
              el.aggregates.childCount > 0
                ? ([{ loading: true }] as (Asset & { loading?: boolean })[])
                : undefined,
          };
          return prev;
        },
        {} as {
          [key in number]: Asset & {
            children?: (Asset | { loading?: boolean })[];
          };
        }
      );

      await Promise.all(
        ids.map(async id => {
          const countFilter = {
            limit: 1000,
            filter: {
              parentIds: [id],
            },
            aggregatedProperties: ['childCount'],
          } as AssetFilterProps;
          const items = await cache.fetchQuery<Asset[]>(
            listKey('assets', countFilter),
            () => listApi(sdk, 'assets', countFilter),
            {
              staleTime: Infinity,
            }
          );

          items.forEach(el => {
            const item = {
              ...el,
              children:
                el.aggregates &&
                el.aggregates.childCount &&
                el.aggregates.childCount > 0
                  ? (assetsMap[el.id] && assetsMap[el.id].children) ||
                    ([{ loading: true }] as (Asset & { loading?: boolean })[])
                  : undefined,
            };
            assetsMap[el.id] = item;
            if (el.parentId) {
              if (!assetsChildrenMap[el.parentId]) {
                assetsChildrenMap[el.parentId] = [];
              }
              assetsChildrenMap[el.parentId].push(el.id);
            }
            return item;
          });
        })
      );

      return constructTree(rootAssetIds, assetsChildrenMap, assetsMap);
    },
    { enabled: rootAssets.length > 0 }
  );
};

const constructTree = <T>(
  ids: number[],
  idsChildrenMap: { [key in number]: number[] },
  resourceMap: { [key in number]: T }
): (T & { children?: T[] })[] => {
  return ids.map(id => ({
    ...resourceMap[id],
    children: idsChildrenMap[id]
      ? constructTree(idsChildrenMap[id], idsChildrenMap, resourceMap)
      : // @ts-ignore
        resourceMap[id].children,
  }));
};
