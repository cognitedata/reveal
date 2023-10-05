import {
  AssetMapping3D,
  AssetMapping3DBase,
  CogniteClient,
  ListResponse,
} from '@cognite/sdk/dist/src';

import { getCdfCadContextualization } from './getCdfCadContextualization';

export const deleteCdfThreeDCadContextualization = async ({
  sdk,
  modelId,
  revisionId,
  nodeIds,
}: {
  sdk: CogniteClient;
  modelId: number;
  revisionId: number;
  nodeIds: Array<number>;
}) => {
  const baseNodesToDelete: Array<AssetMapping3DBase> = [];
  const nodesToDelete: ListResponse<AssetMapping3D[]> = { items: [] };
  await Promise.all(
    nodeIds.map(async (nodeId) => {
      const mappedNodes = await getCdfCadContextualization({
        sdk: sdk,
        modelId: modelId,
        revisionId: revisionId,
        nodeId: nodeId,
      });
      mappedNodes.forEach((item) => {
        const mappingForDeletion: AssetMapping3D = {
          nodeId: nodeId,
          assetId: item.assetId,
          treeIndex: item.treeIndex,
          subtreeSize: item.subtreeSize,
        };
        const baseMappingForDeletion: AssetMapping3DBase = {
          nodeId: nodeId,
          assetId: item.assetId,
        };
        baseNodesToDelete.push(baseMappingForDeletion);
        nodesToDelete.items.push(mappingForDeletion);
      });
    })
  );

  if (baseNodesToDelete.length) {
    await sdk.assetMappings3D.delete(modelId, revisionId, baseNodesToDelete);
  }
  return nodesToDelete;
};
