import { CogniteClient } from '@cognite/sdk/dist/src';

import { createCdfThreeDCadContextualization } from './createCdfThreeDCadContextualization';

export const saveCdfThreeDCadContextualization = ({
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
  nodeIds.forEach((nodeId: number) => {
    createCdfThreeDCadContextualization({
      sdk: sdk,
      modelId: modelId,
      revisionId: revisionId,
      assetRefId: assetId,
      nodeId: nodeId,
    });
  });
};
