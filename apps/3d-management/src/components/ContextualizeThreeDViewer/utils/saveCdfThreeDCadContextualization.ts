import { AssetMapping3DBase, CogniteClient } from '@cognite/sdk';

import { createCdfThreeDCadContextualization } from './createCdfThreeDCadContextualization';

export const saveCdfThreeDCadContextualization = async ({
  sdk,
  modelId,
  revisionId,
  nodeIds,
  assetId,
}: {
  sdk: CogniteClient;
  modelId: number;
  revisionId: number;
  nodeIds: Array<number>;
  assetId: number;
}) => {
  if (nodeIds.length === 0) return;

  const mappings = nodeIds.map(
    (nodeId): AssetMapping3DBase => ({ nodeId, assetId })
  );
  await createCdfThreeDCadContextualization({
    sdk,
    modelId,
    revisionId,
    mappings,
  });
};
