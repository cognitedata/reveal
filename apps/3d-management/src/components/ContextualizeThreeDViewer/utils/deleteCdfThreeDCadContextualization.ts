import { AssetMapping3DBase, CogniteClient } from '@cognite/sdk/dist/src';

import { getCdfCadContextualization } from './getCdfCadContextualization';

export const deleteCdfThreeDCadContextualization = ({
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
  const assetMappingsToDelete: Array<AssetMapping3DBase> = [];

  nodeIds.forEach(async (nodeId, index) => {
    const mappedAssets = await getCdfCadContextualization({
      sdk: sdk,
      modelId: modelId,
      revisionId: revisionId,
      nodeId: nodeId,
    });
    mappedAssets.items.forEach((asset) => {
      const mapping: AssetMapping3DBase = {
        nodeId: nodeId,
        assetId: asset.assetId,
      };
      assetMappingsToDelete.push(mapping);
    });
    // the last one
    // TODO: refactor this with promises/async
    if (index >= nodeIds.length - 1) {
      if (assetMappingsToDelete.length) {
        sdk.assetMappings3D.delete(modelId, revisionId, assetMappingsToDelete);
      }
    }
  });
};
