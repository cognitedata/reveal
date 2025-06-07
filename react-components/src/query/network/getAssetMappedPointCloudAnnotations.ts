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

  const uniqueAnnotationMapping = uniq(annotationMapping);

  const assets = await Promise.all(
    chunk(uniqueAnnotationMapping, 1000).map(async (uniqueAssetsChunk) => {
      const retrievedAssets = await sdk.assets.retrieve(
        uniqueAssetsChunk.map((assetId) => {
          if (typeof assetId === 'number') {
            return { id: assetId };
          } else {
            return { externalId: assetId };
          }
        }),
        { ignoreUnknownIds: true }
      );
      return retrievedAssets;
    })
  );

  return assets.flat();
}
