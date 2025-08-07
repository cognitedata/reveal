import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { type DmCadAssetMapping } from '../../CacheProvider/cad/assetMappingTypes';
import { type FdmConnectionWithNode } from '../../CacheProvider/types';
import { type CadModelOptions } from '../../Reveal3DResources';
import { isDefined } from '../../../utilities/isDefined';
import { inspectNodes } from '../../CacheProvider/requests';
import { uniqBy } from 'lodash';
import { useContext } from 'react';
import { UseGetDMConnectionWithNodeFromHybridMappingsQueryContext } from './useGetDMConnectionWithNodeFromHybridMappingsQuery.context';

export function useGetDMConnectionWithNodeFromHybridMappingsQuery(
  nodeWithDmIdsFromHybridMappings: DmCadAssetMapping[],
  models: CadModelOptions[]
): UseQueryResult<FdmConnectionWithNode[]> {
  const { useClassicCadAssetMappingCache, useFdmSdk } = useContext(
    UseGetDMConnectionWithNodeFromHybridMappingsQueryContext
  );
  const assetMappingCache = useClassicCadAssetMappingCache();
  const fdmSDK = useFdmSdk();
  const dmIds = nodeWithDmIdsFromHybridMappings.map((item) => item.instanceId).filter(isDefined);

  return useQuery({
    queryKey: ['fdm-mappings', dmIds, models],
    queryFn: async () => {
      const dataResult = await Promise.all(
        models.flatMap(async ({ modelId, revisionId }) => {
          const assetMappingDataPerModelAndInstance =
            await assetMappingCache.getNodesForInstanceIds(modelId, revisionId, dmIds);

          if (assetMappingDataPerModelAndInstance.size === 0) {
            return [];
          }
          const dmNodesInspect = await inspectNodes(fdmSDK, dmIds);
          return dmNodesInspect.items.flatMap((dmNode) => {
            if (!assetMappingDataPerModelAndInstance.has(`${dmNode.space}/${dmNode.externalId}`)) {
              return [];
            }
            const cadNodesData = assetMappingDataPerModelAndInstance.get(
              `${dmNode.space}/${dmNode.externalId}`
            );
            if (cadNodesData === undefined) return [];

            const views = dmNode.inspectionResults.involvedViews ?? [];
            return cadNodesData.map((cadNodeItem) => {
              return {
                connection: {
                  instance: {
                    externalId: dmNode.externalId,
                    space: dmNode.space
                  },
                  instanceType: 'node',
                  modelId,
                  revisionId,
                  treeIndex: cadNodeItem.treeIndex
                },
                cadNode: {
                  id: cadNodeItem.id,
                  parentId: cadNodeItem.parentId,
                  depth: cadNodeItem.depth,
                  name: cadNodeItem.name,
                  modelId,
                  revisionId,
                  nodeId: cadNodeItem.id,
                  treeIndex: cadNodeItem.treeIndex,
                  subtreeSize: cadNodeItem.subtreeSize,
                  instanceType: 'node',
                  version: 1,
                  properties: cadNodeItem.properties
                },
                views
              };
            });
          });
        })
      );
      const uniqueDataResult = uniqBy(dataResult.flat(), uniqueFdmConnectionWithNodeItem);
      return uniqueDataResult;
    },
    enabled: dmIds.length > 0 && models.length > 0,
    staleTime: Infinity
  });
}

function uniqueFdmConnectionWithNodeItem(item: FdmConnectionWithNode): string {
  return `${item.connection.modelId}/${item.connection.revisionId}/${item.connection.instance.space}/${item.connection.instance.externalId}/${item.cadNode.id}/${item.cadNode.treeIndex}`;
}
