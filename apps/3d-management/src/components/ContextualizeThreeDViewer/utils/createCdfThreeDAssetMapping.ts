import { CogniteClient } from '@cognite/sdk/dist/src';

export const createCdfThreeDAssetMapping = ({
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
  const assetMappingsToCreate = [
    {
      nodeId: nodeId,
      assetId: assetRefId,
    },
  ];

  sdk.assetMappings3D.create(modelId, revisionId, assetMappingsToCreate);
};
