import { type CogniteClient } from '@cognite/sdk';
import { type TaggedAddCadResourceOptions } from '../../components/Reveal3DResources/types';
import { DmsUniqueIdentifier } from '../../data-providers';

export type CadModelNode = {
  modelId: number;
  revisionId: number;
  nodeId: number;
};

export async function getCadModelsForHybrid(
  dmsInstance: DmsUniqueIdentifier,
  sdk: CogniteClient
): Promise<TaggedAddCadResourceOptions[]> {
  const result = await sdk.post<{ items: CadModelNode[] }>(
    `api/v1/projects/${sdk.project}/3d/mappings/modelnodes/filter`,
    {
      data: { limit: 1000, filter: { assetInstanceId: dmsInstance } }
    }
  );

  return result.data.items.map(({ modelId, revisionId }) => ({
    type: 'cad',
    addOptions: { modelId, revisionId }
  }));
}
