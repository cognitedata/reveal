import { type AnnotationsInstanceRef, type Revision3D } from '@cognite/sdk';
import { chunk } from 'lodash-es';
import { type TaggedAddPointCloudResourceOptions } from '../../components/Reveal3DResources/types';
import { type ModelsForInstanceIdParams } from './types';
import { type InstanceId } from '../../utilities/instanceIds';
import { COGNITE_ASSET_SOURCE } from '../../data-providers/core-dm-provider/dataModels';

export async function getPointCloudModelsForAsset({
  sdk,
  assetId
}: ModelsForInstanceIdParams): Promise<TaggedAddPointCloudResourceOptions[]> {
  const data = getData(assetId);
  const modelIdResult = await sdk.annotations
    .reverseLookup({
      filter: { annotatedResourceType: 'threedmodel', data },
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

type AssetOrInstanceRefType =
  | { assetRef: { id: number } }
  | { instanceRef: AnnotationsInstanceRef };

function getData(assetId: InstanceId): AssetOrInstanceRefType {
  if (typeof assetId === 'number') {
    return { assetRef: { id: assetId } };
  }
  const instanceRef: AnnotationsInstanceRef = {
    sources: [COGNITE_ASSET_SOURCE],
    externalId: assetId.externalId,
    space: assetId.space,
    instanceType: 'node'
  };
  return { instanceRef: { ...instanceRef } };
}
