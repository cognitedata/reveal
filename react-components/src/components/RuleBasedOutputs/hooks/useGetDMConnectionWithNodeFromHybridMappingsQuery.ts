import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { type DmCadAssetMapping } from '../../CacheProvider/cad/assetMappingTypes';
import { type FdmConnectionWithNode } from '../../CacheProvider/types';
import { type CadModelOptions } from '../../Reveal3DResources';
import { isDefined } from '../../../utilities/isDefined';
import { inspectNodes } from '../../CacheProvider/requests';
import { uniqBy } from 'lodash-es';
import { useContext, useMemo } from 'react';
import { UseGetDMConnectionWithNodeFromHybridMappingsQueryContext } from './useGetDMConnectionWithNodeFromHybridMappingsQuery.context';
import { type InspectResultList } from '../../../data-providers/FdmSDK';
import { type InstanceKey } from '../../../utilities/instanceIds';
import { type Node3D } from '@cognite/sdk';
import { EMPTY_ARRAY } from '../../../utilities/constants';
import { restrictToDmsId } from '../../../utilities/restrictToDmsId';
import { createFdmKey } from '../../CacheProvider';
import { executeParallel } from '../../../utilities/executeParallel';
import { queryKeys } from '../../../utilities/queryKeys';

export function useGetDMConnectionWithNodeFromHybridMappingsQuery(
  nodeWithDmIdsFromHybridMappings: DmCadAssetMapping[],
  models: CadModelOptions[]
): UseQueryResult<FdmConnectionWithNode[]> {
  const { useClassicCadAssetMappingCache, useFdmSdk } = useContext(
    UseGetDMConnectionWithNodeFromHybridMappingsQueryContext
  );
  const assetMappingCache = useClassicCadAssetMappingCache();
  const fdmSDK = useFdmSdk();
  const dmIds = useMemo(
    () => nodeWithDmIdsFromHybridMappings.map((item) => item.instanceId).filter(isDefined),
    [nodeWithDmIdsFromHybridMappings]
  );

  return useQuery({
    queryKey: queryKeys.fdmConnectionWithNode(dmIds, models),
    queryFn: async () => {
      if (dmIds.length === 0 || models.length === 0) {
        return EMPTY_ARRAY;
      }
      const dmNodesInspect = await inspectNodes(fdmSDK, dmIds);
      if (dmNodesInspect.items.length === 0) {
        return EMPTY_ARRAY;
      }

      const dataResult = await executeParallel(
        models.map(({ modelId, revisionId }) => async () => {
          const assetMappingDataPerModelAndInstance =
            await assetMappingCache.getNodesForInstanceIds(modelId, revisionId, dmIds);

          if (assetMappingDataPerModelAndInstance.size === 0) {
            return EMPTY_ARRAY;
          }
          return generateFdmConnectionsFromInspectResultAndMappings(
            dmNodesInspect,
            assetMappingDataPerModelAndInstance,
            modelId,
            revisionId
          );
        }),
        2
      );
      const uniqueDataResult = uniqBy(
        dataResult.filter(isDefined).flat(),
        uniqueFdmConnectionWithNodeItem
      );
      return uniqueDataResult;
    },
    enabled: dmIds.length > 0 && models.length > 0,
    staleTime: Infinity
  });
}

function uniqueFdmConnectionWithNodeItem(item: FdmConnectionWithNode): string {
  return `${item.connection.modelId}/${item.connection.revisionId}/${item.connection.instance.space}/${item.connection.instance.externalId}/${item.cadNode.id}`;
}

function generateFdmConnectionsFromInspectResultAndMappings(
  dmNodesInspect: InspectResultList,
  assetMappingDataPerModelAndInstance: Map<InstanceKey, Node3D[]>,
  modelId: number,
  revisionId: number
): FdmConnectionWithNode[] {
  return dmNodesInspect.items.flatMap((dmNode) => {
    const dmNodeIdentifier = createFdmKey(dmNode);
    if (!assetMappingDataPerModelAndInstance.has(dmNodeIdentifier)) {
      return [];
    }
    const cadNodesData = assetMappingDataPerModelAndInstance.get(dmNodeIdentifier);
    if (cadNodesData === undefined) return [];

    const views = dmNode.inspectionResults.involvedViews ?? [];
    return cadNodesData.map((cadNodeItem) => {
      return {
        connection: {
          instance: restrictToDmsId(dmNode),
          modelId,
          revisionId,
          treeIndex: cadNodeItem.treeIndex
        },
        cadNode: cadNodeItem,
        views
      };
    });
  });
}
