import { AssetMapping3DBase, CogniteClient } from '@cognite/sdk/dist/src';

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
  const mappedNodesToDelete: Array<AssetMapping3DBase> = [];

  await Promise.all(
    nodeIds.map(async (nodeId) => {
      const mappedNodes = await getCdfCadContextualization({
        sdk: sdk,
        modelId: modelId,
        revisionId: revisionId,
        nodeId: nodeId,
      });
      mappedNodes.items.forEach((asset) => {
        const mapping: AssetMapping3DBase = {
          nodeId: nodeId,
          assetId: asset.assetId,
        };
        mappedNodesToDelete.push(mapping);
      });
    })
  );

  if (mappedNodesToDelete.length) {
    await sdk.assetMappings3D.delete(modelId, revisionId, mappedNodesToDelete);
  }
  return mappedNodesToDelete;
};
