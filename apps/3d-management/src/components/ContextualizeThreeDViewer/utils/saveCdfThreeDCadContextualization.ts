import { CogniteClient } from '@cognite/sdk/dist/src';

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
  await Promise.all(
    nodeIds.map(async (nodeId: number) => {
      await createCdfThreeDCadContextualization({
        sdk,
        modelId,
        revisionId,
        assetRefId: assetId,
        nodeId,
      });
    })
  );
};
