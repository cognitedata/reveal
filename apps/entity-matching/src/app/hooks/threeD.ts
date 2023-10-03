import {
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import { range } from 'lodash-es';

import { CogniteError, Node3D } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

const PARTITIONS = 10;
const ITEMS_PER_PAGE = 1000;
const KEY_BASE = ['threeD'];

const get3dNodesKey = (modelId: number, revisionId: number): QueryKey => [
  ...KEY_BASE,
  'list',
  'nodes',
  modelId,
  revisionId,
];
export function useInfinite3dNodes(
  { modelId, revisionId }: { modelId: number; revisionId: number },
  options?: UseInfiniteQueryOptions<
    { items: Node3D[]; cursors: (string | undefined)[] },
    CogniteError
  >
) {
  const sdk = useSDK();
  return useInfiniteQuery<
    { items: Node3D[]; cursors: (string | undefined)[] },
    CogniteError
  >(
    get3dNodesKey(modelId, revisionId),
    async ({ pageParam }) => {
      const pages = await (Array.isArray(pageParam)
        ? Promise.all(
            pageParam.map((cursor, i) =>
              cursor
                ? sdk.revisions3D.list3DNodes(modelId, revisionId, {
                    sortByNodeId: true,
                    limit: ITEMS_PER_PAGE,
                    cursor,
                    partition: `${i + 1}/${PARTITIONS}`,
                  })
                : Promise.resolve({ items: [], nextCursor: undefined })
            )
          )
        : Promise.all(
            range(1, PARTITIONS + 1).map((i: any) =>
              sdk.revisions3D.list3DNodes(modelId, revisionId, {
                sortByNodeId: true,
                limit: ITEMS_PER_PAGE,
                partition: `${i}/${PARTITIONS}`,
              })
            )
          ));

      return {
        items: pages.reduce(
          (accl: Node3D[], p: any) => [...accl, ...p.items],
          []
        ),
        cursors: pages.map((p: any) => p.nextCursor),
      };
    },

    {
      getNextPageParam(lastPage) {
        if (lastPage.cursors.filter(Boolean).length > 0) {
          return lastPage.cursors;
        }
      },
      ...options,
    }
  );
}

const get3DModelsKey = () => [...KEY_BASE, 'models', 'list'];
export const use3DModels = () => {
  const sdk = useSDK();
  return useQuery(get3DModelsKey(), () =>
    sdk.models3D.list().autoPagingToArray({ limit: -1 })
  );
};

const get3DModelRevisionKey = (modelId: number): QueryKey => [
  ...KEY_BASE,
  'models',
  modelId,
  'revisions',
];
export const use3DRevisions = (modelId: number) => {
  const sdk = useSDK();
  return useQuery(get3DModelRevisionKey(modelId), () =>
    sdk.revisions3D.list(modelId).autoPagingToArray({ limit: -1 })
  );
};
