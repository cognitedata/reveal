import { type TaggedAddCadResourceOptions } from '../../components/Reveal3DResources/types';
import { type ModelsForAssetParams } from './types';

export type CadModelNode = {
  modelId: number;
  revisionId: number;
  nodeId: number;
};

export async function getCadModelsForAsset({
  assetId,
  sdk
}: ModelsForAssetParams): Promise<TaggedAddCadResourceOptions[]> {
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
