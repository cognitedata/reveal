import { useMemo } from 'react';

import {
  QueryClient,
  useInfiniteQuery,
  useQueries,
  useQueryClient,
} from '@tanstack/react-query';

import { Asset } from '@cognite/sdk';
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

  const rootAssets = useInfiniteQuery(
    queryKeys.rootAssets(rootAssetId),
    ({ pageParam }) => {
      return sdk.assets
        .list({
          filter: {
            rootIds: rootAssetId ? [{ id: rootAssetId }] : undefined,
            root: true,
          },
          aggregatedProperties: ['childCount'],
          limit: 20,
          cursor: pageParam,
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
      getNextPageParam: (param) => param.nextCursor,
    }
  );

  const rootAssetsData = useMemo(() => {
    return rootAssets.data?.pages.flatMap((page) => page.items) || [];
  }, [rootAssets.data?.pages]);

  const rootAssetsSelected = useMemo(() => {
    if (rootAssetId) {
      return rootAssetsData.filter((item) => item.id === rootAssetId);
    }
    return rootAssetsData;
  }, [rootAssetId, rootAssetsData]);

  const transformedData = useMemo(() => {
    return rootAssetsSelected.map((rootAsset) => {
      return {
        ...rootAsset,
        children: rootAsset.aggregates?.childCount
          ? getChildren(rootAsset.id, queryClient)
          : undefined,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childAssets, rootAssetsSelected]);

  return {
    ...rootAssets,
    data: transformedData,
  };
};
