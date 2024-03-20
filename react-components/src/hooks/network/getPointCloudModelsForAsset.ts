/*!
 * Copyright 2024 Cognite AS
 */
import { type AddModelOptions } from '@cognite/reveal';
import { type CogniteClient } from '@cognite/sdk/dist/src';

export async function getPointCloudModelsForAsset(
  assetId: number,
  sdk: CogniteClient
): Promise<AddModelOptions[]> {
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
    modelId: modelIds[index],
    revisionId: revisionList.items[0].id // Always choose the newest revision
  }));
}
