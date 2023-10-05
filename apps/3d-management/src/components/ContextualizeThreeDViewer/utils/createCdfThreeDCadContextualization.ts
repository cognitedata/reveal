import { AssetMapping3DBase, CogniteClient } from '@cognite/sdk/dist/src';

export const createCdfThreeDCadContextualization = async ({
  sdk,
  modelId,
  revisionId,
  assetRefId,
  nodeId,
}: {
  sdk: CogniteClient;
  modelId: number;
  revisionId: number;
  assetRefId: number;
  nodeId: number;
}) => {
  const assetMappingsToCreate: AssetMapping3DBase[] = [
    {
      nodeId: nodeId,
      assetId: assetRefId,
    },
  ];

  await sdk.assetMappings3D.create(modelId, revisionId, assetMappingsToCreate);
};
