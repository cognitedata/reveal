/*!
 * Copyright 2024 Cognite AS
 */
import { type AddModelOptions } from '@cognite/reveal';
import { type CogniteClient } from '@cognite/sdk';

export type CadModelNode = {
  modelId: number;
  revisionId: number;
  nodeId: number;
};

export async function getCadModelsForAsset(
  assetId: number,
  sdk: CogniteClient
): Promise<AddModelOptions[]> {
  const result = await sdk.get<{ items: CadModelNode[] }>(
    `api/v1/projects/${sdk.project}/3d/mappings/${assetId}/modelnodes`,
    {
      params: { limit: 1000 }
    }
  );

  return result.data.items.map(({ modelId, revisionId }) => ({ modelId, revisionId }));
}
