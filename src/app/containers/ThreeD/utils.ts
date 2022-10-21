import { Cognite3DModel, THREE } from '@cognite/reveal';
import { AssetMapping3D, CogniteClient, Node3D } from '@cognite/sdk';

export const getAssetMappingsByAssetId = async (
  sdk: CogniteClient,
  modelId?: number,
  revisionId?: number,
  assetIds: number[] = []
) => {
  if (!modelId || !revisionId) {
    return [];
  }

  const models = await sdk.post<{ items: AssetMapping3D[] }>(
    `/api/v1/projects/${sdk.project}/3d/models/${modelId}/revisions/${revisionId}/mappings/list`,
    { data: { filter: { assetIds }, limit: 1000 } }
  );
  return models.data.items;
};

export const getAncestorByNodeId = async (
  sdk: CogniteClient,
  modelId?: number,
  revisionId?: number,
  nodeId?: number
) => {
  if (!modelId || !revisionId || !nodeId) {
    return [];
  }

  const ancestors = await sdk.revisions3D.list3DNodeAncestors(
    modelId,
    revisionId,
    nodeId,
    {
      limit: 1000,
    }
  );
  return ancestors.items;
};

export const getAssetIdFromMapped3DNode = async (
  sdk: CogniteClient,
  modelId?: number,
  revisionId?: number,
  ancestorNodes: Node3D[] = []
) => {
  if ((!modelId && !revisionId) || ancestorNodes.length === 0) {
    return null;
  }

  const assetNodeIds = ancestorNodes
    .filter(node => node.depth !== 0)
    .map(node => node.id);

  const assetMapped3DNodes = await sdk.assetMappings3D.filter(
    modelId!,
    revisionId!,
    {
      filter: {
        nodeIds: assetNodeIds,
      },
    }
  );
  for (const nodeId of assetNodeIds.reverse()) {
    const mappedNode = assetMapped3DNodes.items.find(
      node => nodeId == node.nodeId
    );
    if (mappedNode?.assetId) {
      return mappedNode.assetId;
    }
  }
  return null;
};

export async function selectAssetBoundingBox(
  assetMappings: AssetMapping3D[],
  model: Cognite3DModel
): Promise<THREE.Box3 | null> {
  const boundingBox = new THREE.Box3();

  await Promise.all(
    assetMappings.map(async assetMapping => {
      const { nodeId } = assetMapping;
      const nodeBoundingBox = await model.getBoundingBoxByNodeId(nodeId);
      boundingBox.union(nodeBoundingBox);
    })
  );

  return boundingBox;
}

export const get3dAssetMappings = async (
  sdk: CogniteClient,
  modelId?: number,
  revisionId?: number,
  nextCursor?: string,
  limit?: number
) =>
  sdk.get(
    `/api/v1/projects/${sdk.project}/3d/models/${modelId}/revisions/${revisionId}/mappings`,
    { params: { limit: limit || 1000, cursor: nextCursor } }
  );
