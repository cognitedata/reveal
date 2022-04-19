import { AssetFilterProps, Asset } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import {
  useSearch,
  useList,
  retrieveItemsKey,
  byIdKey,
  listKey,
  listApi,
} from '@cognite/sdk-react-query-hooks';
import { useQueryClient, useQuery, UseQueryOptions } from 'react-query';

export type ConstructedTreeAssetChildren =
  | ConstructedTreeAsset
  | { loading?: boolean };

export type ConstructedTreeAsset = Asset & {
  children?: ConstructedTreeAssetChildren[];
};

export type ConstructedTreeAssetMap = { [key in number]: ConstructedTreeAsset };

export const useSearchTree = (
  filter: AssetFilterProps,
  query?: string,
  config?: UseQueryOptions<ConstructedTreeAsset[]>
) => {
  const sdk = useSDK();
  const client = useQueryClient();
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
    isFetched: listFetched,
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
  const isFetched = enableSearch ? searchFeched : listFetched;
  const isFetching = enableSearch ? searchFetching : listFetching;
  const error = enableSearch ? searchError : listError;
  const isError = enableSearch ? searchIsError : listIsError;

  const enabled = isFetched;

  const fetchAndBuildTree = async () => {
    const rootAssets: number[] = [];
    const assetsMap: ConstructedTreeAssetMap = {};
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
      const items = await client.fetchQuery(
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
  const treeResult = useQuery<ConstructedTreeAsset[]>(
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
  config?: UseQueryOptions<ConstructedTreeAsset[]>
) => {
  const sdk = useSDK();
  const client = useQueryClient();

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

  return useQuery<ConstructedTreeAsset[]>(
    ['asset-list-tree', openIds],
    async () => {
      const rootAssetIds: number[] = rootAssets.map(el => el.id);
      const assetsChildrenMap: {
        [key in number]: number[];
      } = {};

      const assetsMap: ConstructedTreeAssetMap = rootAssets.reduce(
        (prev, el) => {
          prev[el.id] = {
            ...el,
            children:
              el.aggregates &&
              el.aggregates.childCount &&
              el.aggregates.childCount > 0
                ? [{ loading: true }]
                : undefined,
          };
          return prev;
        },
        {} as ConstructedTreeAssetMap
      );

      await Promise.all(
        openIds.map(async id => {
          const countFilter = {
            limit: 1000,
            filter: {
              parentIds: [id],
            },
            aggregatedProperties: ['childCount'],
          } as AssetFilterProps;
          const items = await client.fetchQuery<Asset[]>(
            listKey('assets', countFilter),
            () => listApi(sdk, 'assets', countFilter),
            {
              staleTime: Infinity,
            }
          );

          items.forEach(el => {
            const item: ConstructedTreeAsset = {
              ...el,
              children:
                el.aggregates &&
                el.aggregates.childCount &&
                el.aggregates.childCount > 0
                  ? (assetsMap[el.id] && assetsMap[el.id].children) || [
                      { loading: true },
                    ]
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

const constructTree = (
  ids: number[],
  idsChildrenMap: { [key in number]: number[] },
  resourceMap: ConstructedTreeAssetMap
): ConstructedTreeAsset[] => {
  const sortedIds = ids.sort((idA, idB) => {
    const nameA = resourceMap[idA].name ?? '';
    const nameB = resourceMap[idB].name ?? '';
    return nameA.localeCompare(nameB);
  });

  return sortedIds.map(id => ({
    ...resourceMap[id],
    children: idsChildrenMap[id]
      ? constructTree(idsChildrenMap[id], idsChildrenMap, resourceMap)
      : resourceMap[id].children,
  }));
};

export const useRootPath = (
  assetId: any,
  config?: UseQueryOptions<number[], unknown, number[], (string | number)[]>
) => {
  const sdk = useSDK();
  const client = useQueryClient();
  return useQuery(
    ['asset-root-path', assetId],
    async () => {
      const pathToRoot: number[] = [];
      let curAssetId = assetId;
      try {
        while (curAssetId) {
          // eslint-disable-next-line no-await-in-loop
          const asset = await client.fetchQuery(
            byIdKey('assets', curAssetId),
            // eslint-disable-next-line no-loop-func
            () => sdk.assets.retrieve([{ id: curAssetId }]),
            {
              staleTime: 60 * 1000,
            }
          );
          if (asset[0].parentId) {
            pathToRoot.push(asset[0].parentId);
          }
          curAssetId = asset[0].parentId;
        }
      } catch (error) {
        throw new Error('Something went wrong while fetching assets.');
      }
      return pathToRoot;
    },
    { ...config }
  );
};
