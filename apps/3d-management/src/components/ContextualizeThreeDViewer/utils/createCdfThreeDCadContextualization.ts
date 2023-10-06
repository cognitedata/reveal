import { AssetMapping3DBase, CogniteClient } from '@cognite/sdk';

export const createCdfThreeDCadContextualization = async ({
  sdk,
  modelId,
  revisionId,
  mappings,
}: {
  sdk: CogniteClient;
  modelId: number;
  revisionId: number;
  mappings: Array<AssetMapping3DBase>;
}) => {
  await sdk.assetMappings3D.create(modelId, revisionId, mappings);
};
