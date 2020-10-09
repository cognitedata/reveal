import {
  useSearch,
  useList,
  retrieveItemsKey,
  listKey,
  listApi,
} from 'hooks/sdk';
import { AssetFilterProps, Asset } from '@cognite/sdk';
import { useContext } from 'react';
import { SdkContext } from 'context/sdk';
import { QueryKey, useQueryCache, useQuery, QueryConfig } from 'react-query';

export const useLoadSearchTree = (
  query: string,
  filter: AssetFilterProps,
  config?: QueryConfig<Asset[]>,
  config2?: QueryConfig<Asset[]>
) => {
  const sdk = useContext(SdkContext)!;
  const cache = useQueryCache();

  const { data: searchResults, isFetched } = useSearch<Asset>(
    'assets',
    query,
    {
      filter: Object.keys(filter || {}).length > 0 ? filter : undefined,
    },
    config
  );

  return useQuery<(Asset & { children?: Asset[] })[]>(
    ['asset-list-tree', isFetched, query],
    async () => {
      if (searchResults) {
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

        searchResults.forEach(processItems);

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
      }
      return [];
    },
    config2
  );
};

export const useLoadListTree = (
  filter: AssetFilterProps,
  openIds: number[] = [],
  config?: QueryConfig<Asset[]>
) => {
  const sdk = useContext(SdkContext)!;
  const cache = useQueryCache();

  const { data: searchResults } = useList<Asset>(
    'assets',
    {
      limit: 1000,
      filter,
      aggregatedProperties: ['childCount'],
    },
    {
      staleTime: Infinity,
      ...config,
    }
  );

  return useQuery<(Asset & { children?: Asset[] })[]>(
    ['asset-list-tree', (searchResults || []).map(e => e.id), openIds],
    async (_: QueryKey, _2: number[], ids: number[]) => {
      if (searchResults) {
        const rootAssets: number[] = searchResults.map(el => el.id);
        const assetsChildrenMap: {
          [key in number]: number[];
        } = {};
        const assetsMap = searchResults.reduce(
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

        return constructTree(rootAssets, assetsChildrenMap, assetsMap);
      }
      return [];
    }
  );
};

const constructTree = <T,>(
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
