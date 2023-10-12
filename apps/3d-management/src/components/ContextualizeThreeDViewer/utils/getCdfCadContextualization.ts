import { AssetMappings3DListFilter, CogniteClient } from '@cognite/sdk';

export const getCdfCadContextualization = async ({
  sdk,
  modelId,
  revisionId,
  nodeId,
}: {
  sdk: CogniteClient;
  modelId: number;
  revisionId: number;
  nodeId: number | undefined;
}) => {
  const filter: AssetMappings3DListFilter = {};
  if (nodeId) {
    filter.nodeId = nodeId;
  }

  return await sdk.assetMappings3D
    .list(modelId, revisionId, filter)
    .autoPagingToArray({ limit: Infinity });
};
