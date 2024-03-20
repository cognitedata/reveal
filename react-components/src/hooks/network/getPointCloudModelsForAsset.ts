/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk/dist/src';
import { TaggedAdd3DModelOptions } from '../../components/Reveal3DResources/types';

export async function getPointCloudModelsForAsset(
  assetId: number,
  sdk: CogniteClient
): Promise<TaggedAdd3DModelOptions[]> {
  const modelIdResult = await sdk.annotations.reverseLookup({
    filter: { annotatedResourceType: 'threedmodel', data: { assetRef: { id: assetId } } },
    limit: 5
  });

  const modelIds = modelIdResult.items.reduce((accModelIds: number[], ids) => {
    if (ids.id === undefined) {
      return accModelIds;
    }

    accModelIds.push(ids.id);
    return accModelIds;
  }, []);

  const revisionItems = await Promise.all(
    modelIds.map(async (modelId) => await sdk.revisions3D.list(modelId))
  );

  return revisionItems.map((revisionList, index) => ({
    type: 'pointcloud',
    addOptions: {
      modelId: modelIds[index],
      revisionId: revisionList.items[0].id // Always choose the newest revision
    }
  }));
}
