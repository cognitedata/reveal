import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useClassicCadAssetMappingCache } from "../../CacheProvider/CacheProvider";
import { DmCadAssetMapping } from "../../CacheProvider/cad/assetMappingTypes";
import { FdmConnectionWithNode } from "../../CacheProvider/types";
import { CadModelOptions } from "../../Reveal3DResources";
import { useFdmSdk } from "../../RevealCanvas/SDKProvider";
import { isDefined } from "../../../utilities/isDefined";
import { inspectNodes } from "../../CacheProvider/requests";
import { uniqBy } from "lodash";

export function useGetDMConnectionWithNodeFromHybridMappingsQuery(
  nodeWithDmIdsFromHybridMappings: DmCadAssetMapping[],
  models: CadModelOptions[]
): UseQueryResult<FdmConnectionWithNode[]> {
  const assetMappingCache = useClassicCadAssetMappingCache();
  const fdmSDK = useFdmSdk();
  const dmIds = nodeWithDmIdsFromHybridMappings.map((item) => item.instanceId).filter(isDefined);

  return useQuery({
    queryKey: ['fdm-mappings', dmIds, models],
    queryFn: async () => {
      if (assetMappingCache === undefined) {
        return [];
      }

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
                  modelId: modelId,
                  revisionId: revisionId,
                  treeIndex: cadNodeItem.treeIndex,
                },
                cadNode: {
                  modelId: modelId,
                  revisionId: revisionId,
                  nodeId: cadNodeItem.id,
                  treeIndex: cadNodeItem.treeIndex,
                  subtreeSize: cadNodeItem.subtreeSize,
                  instanceType: 'node',
                  version: 1,
                  properties: cadNodeItem.properties
                },
                views: views
              };
            });
          });
        })
      );
      const uniqueDataResult = uniqBy(dataResult.flat().filter(isDefined), (item) => {
        return `${item.connection.modelId}/${item.connection.revisionId}/${item.connection.instance.space}/${item.connection.instance.externalId}/${item.cadNode.nodeId}/${item.cadNode.treeIndex}`;
      });
      return uniqueDataResult;
    },
    enabled: dmIds.length > 0 && models.length > 0,
    staleTime: Infinity
  });
}
