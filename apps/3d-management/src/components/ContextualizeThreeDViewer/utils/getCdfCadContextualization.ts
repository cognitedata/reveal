import { CogniteClient } from '@cognite/sdk/dist/src';

export const getCdfCadContextualization = async ({
  sdk,
  modelId,
  revisionId,
}: {
  sdk: CogniteClient;
  modelId: number;
  revisionId: number;
}) => {
  const mapping3D = await sdk.assetMappings3D.list(modelId, revisionId);
  return mapping3D;
};
