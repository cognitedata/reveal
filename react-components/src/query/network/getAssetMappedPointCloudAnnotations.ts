import { type ClassicDataSourceType } from '@cognite/reveal';
import {
  type AnnotationFilterProps,
  type AnnotationModel,
  type AnnotationsBoundingVolume,
  type Asset,
  type CogniteClient
} from '@cognite/sdk';
import { chunk, uniq } from 'lodash';
import { type AddPointCloudResourceOptions } from '../../components';

const MAX_PARALLEL_ASSET_REQUESTS = 5;

export async function getAssetsMappedPointCloudAnnotations(
  sdk: CogniteClient,
  models: Array<AddPointCloudResourceOptions<ClassicDataSourceType>>
): Promise<Asset[]> {
  const modelIdList = models.map((model) => model.modelId);

  const pointCloudAnnotations = await getPointCloudAnnotations(modelIdList, sdk);
  return await getPointCloudAnnotationAssets(pointCloudAnnotations, sdk);
}

async function getPointCloudAnnotations(
  modelIdList: number[],
  sdk: CogniteClient
): Promise<AnnotationModel[]> {
  const annotationArray = await Promise.all(
    chunk(modelIdList, 1000).map(async (modelIdList) => {
      const filter: AnnotationFilterProps = {
        annotatedResourceIds: modelIdList.map((id) => ({ id })),
        annotatedResourceType: 'threedmodel',
        annotationType: 'pointcloud.BoundingVolume'
      };
      const annotations = await sdk.annotations
        .list({
          filter,
          limit: 1000
        })
        .autoPagingToArray({ limit: Infinity });
      return annotations;
    })
  );

  return annotationArray.flatMap((annotations) => annotations);
}

async function getPointCloudAnnotationAssets(
  pointCloudAnnotations: AnnotationModel[],
  sdk: CogniteClient
): Promise<Asset[]> {
  // TODO: Replace the check for assetRef similar to Point Cloud Asset Styling
  const annotationMapping = pointCloudAnnotations
    .map(
      (annotation) =>
        (annotation.data as AnnotationsBoundingVolume).assetRef?.id ??
        (annotation.data as AnnotationsBoundingVolume).assetRef?.externalId
    )
    .filter((annotation): annotation is string | number => annotation !== undefined);

  const uniqueMappingAssetId = uniq(annotationMapping);

  const assetIdChunks = chunk(uniqueMappingAssetId, 1000);

  const allAssetResults: Asset[] = [];

  for (const assetIdChunkBatch of chunk(assetIdChunks, MAX_PARALLEL_ASSET_REQUESTS)) {
    const assetsForChunkBatch = await Promise.all(
      assetIdChunkBatch.map(
        async (assetIdChunk) =>
          await sdk.assets.retrieve(
            assetIdChunk.map((assetId) => {
              if (typeof assetId === 'number') {
                return { id: assetId };
              } else {
                return { externalId: assetId };
              }
            }),
            { ignoreUnknownIds: true }
          )
      )
    );

    allAssetResults.push(...assetsForChunkBatch.flat());
  }

  return allAssetResults;
}
