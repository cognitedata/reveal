import { useSDK } from '@cognite/sdk-provider';

import { useQuery } from 'react-query';
import { InternalAssetData } from '@data-exploration-lib/domain-layer';

export type ConstructedTreeAssetChildren =
  | ConstructedTreeAsset
  | { loading?: boolean };

export type ConstructedTreeAsset = InternalAssetData & {
  children?: ConstructedTreeAssetChildren[];
};

export type ConstructedTreeAssetMap = { [key in number]: ConstructedTreeAsset };

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

  return sortedIds.map((id) => ({
    ...resourceMap[id],
    children: idsChildrenMap[id]
      ? constructTree(idsChildrenMap[id], idsChildrenMap, resourceMap)
      : resourceMap[id].children,
  }));
};

export const useRootPath = (assetId: number | undefined) => {
  const sdk = useSDK();
  return useQuery(
    ['asset-root-path', assetId],
    () => {
      return sdk.assets
        .retrieve([{ id: assetId! }], {
          aggregatedProperties: ['path'],
        })
        .then((res) => {
          // @ts-ignore
          return res[0]?.aggregates?.path?.map((path) => path?.id);
        });
    },
    { enabled: !!assetId }
  );
};
