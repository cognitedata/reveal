import { useCallback, useMemo } from 'react';

import {
  QueryClient,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { Asset, ListResponse } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { getAssetsList } from '../network';

const getChildren = (
  parentAssetId: number,
  queryClient: QueryClient
): Asset[] | undefined => {
  return queryClient
    .getQueryData<Asset[]>(queryKeys.assetChildren(parentAssetId))
    ?.map((asset) => {
      return {
        ...asset,
        children: asset.aggregates?.childCount
          ? getChildren(asset.id, queryClient)
          : undefined,
      };
    });
};

export const useRootAssetsQuery = (
  expandedRootIds: number[],
  rootAssetId?: number // if we want to use only some specific rootId
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  const selectCallback = useCallback(
    (data: ListResponse<Asset[]>) => {
      if (rootAssetId) {
        return {
          ...data,
          items: data.items.filter((item) => item.id === rootAssetId),
        };
      }

      return data;
    },
    [rootAssetId]
  );

  const childAssets = useQueries({
    queries: expandedRootIds.map((assetId) => {
      return {
        queryKey: queryKeys.assetChildren(assetId),
        queryFn: () => {
          return getAssetsList(sdk, {
            filter: { parentIds: [assetId] },
            aggregatedProperties: ['childCount'],
            sort: [
              {
                property: ['name'],
              },
            ],
          }).then((res) => res.items);
        },
      };
    }),
  });

  const rootAssets = useQuery(
    queryKeys.rootAssets(),
    () => {
      return sdk.assets
        .list({
          filter: { root: true },
          aggregatedProperties: ['childCount'],
        })
        .then((res) => {
          return {
            ...res,
            items: res.items.sort((a: Asset, b: Asset) => {
              return a.name.localeCompare(b.name);
            }),
          };
        });
    },
    {
      select: selectCallback,
    }
  );

  return useMemo(() => {
    return rootAssets.data?.items.map((rootAsset) => {
      return {
        ...rootAsset,
        children: rootAsset.aggregates?.childCount
          ? getChildren(rootAsset.id, queryClient)
          : undefined,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childAssets, rootAssets]);
};
