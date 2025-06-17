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
import { getAssetsForIds } from './getAssetsForIds';
import { toIdEither } from '../../utilities/instanceIds/toIdEither';
import { type AllAssetFilterProps } from './types';

export async function getAssetsMappedPointCloudAnnotations(
  models: Array<AddPointCloudResourceOptions<ClassicDataSourceType>>,
  filter: AllAssetFilterProps | undefined,
  sdk: CogniteClient
): Promise<Asset[]> {
  const modelIdList = models.map((model) => model.modelId);

  const pointCloudAnnotations = await getPointCloudAnnotations(modelIdList, sdk);
  return await getPointCloudAnnotationAssets(pointCloudAnnotations, filter, sdk);
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
  filter: AllAssetFilterProps | undefined,
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

  const assetRefs = uniqueMappingAssetId.map(toIdEither);
  return await getAssetsForIds(assetRefs, filter, sdk);
}
