import { AssetMappings3DListFilter, CogniteClient } from '@cognite/sdk';

const createFilter = ({
  nodeId,
  assetId,
}: {
  nodeId: number | undefined;
  assetId: number | undefined;
}): AssetMappings3DListFilter => {
  const filter: AssetMappings3DListFilter = {};
  filter.nodeId = nodeId ? nodeId : undefined;
  filter.assetId = assetId ? assetId : undefined;
  return filter;
};

export const getCdfCadContextualization = async ({
  sdk,
  modelId,
  revisionId,
  nodeId,
  assetId,
}: {
  sdk: CogniteClient;
  modelId: number;
  revisionId: number;
  nodeId: number | undefined;
  assetId: number | undefined;
}) => {
  const filter = createFilter({ nodeId, assetId });

  return await sdk.assetMappings3D
    .list(modelId, revisionId, filter)
    .autoPagingToArray({ limit: Infinity });
};
