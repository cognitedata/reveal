/*!
 * Copyright 2024 Cognite AS
 */
import { type Revision3D, type CogniteClient } from '@cognite/sdk/dist/src';
import { chunk } from 'lodash';
import { type TaggedAddPointCloudResourceOptions } from '../../components/Reveal3DResources/types';

export async function getPointCloudModelsForAsset(
  assetId: number,
  sdk: CogniteClient
): Promise<TaggedAddPointCloudResourceOptions[]> {
  const modelIdResult = await sdk.annotations
    .reverseLookup({
      filter: { annotatedResourceType: 'threedmodel', data: { assetRef: { id: assetId } } },
      limit: 1000
    })
    .autoPagingToArray({ limit: Infinity });

  const modelIds = modelIdResult.reduce((accModelIds: number[], ids) => {
    if (ids.id === undefined) {
      return accModelIds;
    }

    accModelIds.push(ids.id);
    return accModelIds;
  }, []);

  const modelChunks = chunk(modelIds, 4);

  const revisionList: Revision3D[] = [];

  for (const modelChunk of modelChunks) {
    const revisionItems = await Promise.all(
      modelChunk.map(
        async (modelId) =>
          await sdk.revisions3D.list(modelId, { limit: 1 }).autoPagingToArray({ limit: 1 })
      )
    );

    revisionList.push(...revisionItems.flat());
  }

  return revisionList.map((revision, index) => ({
    type: 'pointcloud',
    addOptions: {
      modelId: modelIds[index],
      revisionId: revision.id // Always choose the newest revision
    }
  }));
}
