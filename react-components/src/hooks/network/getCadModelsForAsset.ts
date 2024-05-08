/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk';
import { type TaggedAdd3DModelOptions } from '../../components/Reveal3DResources/types';

export type CadModelNode = {
  modelId: number;
  revisionId: number;
  nodeId: number;
};

export async function getCadModelsForAsset(
  assetId: number,
  sdk: CogniteClient
): Promise<TaggedAdd3DModelOptions[]> {
  const result = await sdk.get<{ items: CadModelNode[] }>(
    `api/v1/projects/${sdk.project}/3d/mappings/${assetId}/modelnodes`,
    {
      params: { limit: 1000 }
    }
  );

  return result.data.items.map(({ modelId, revisionId }) => ({
    type: 'cad',
    addOptions: { modelId, revisionId }
  }));
}
