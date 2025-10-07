import { type ClassicDataSourceType } from '@cognite/reveal';
import {
  type AnnotationsView,
  type AnnotationFilterProps,
  type AnnotationModel,
  type AnnotationsBoundingVolume,
  type Asset,
  type CogniteClient
} from '@cognite/sdk';
import { chunk, uniq, uniqBy } from 'lodash';
import { createFdmKey, type AddPointCloudResourceOptions } from '../../components';
import { getAssetsForIds } from './common/getAssetsForIds';
import { toIdEither } from '../../utilities/instanceIds/toIdEither';
import { type AllAssetFilterProps } from './common/filters';
import { type FdmNode, type FdmSDK } from '../../data-providers/FdmSDK';
import { type AssetInstance } from '../../utilities/instances';
import { type AssetProperties } from '../../data-providers/core-dm-provider/utils/filters';
import {
  COGNITE_ASSET_VIEW_VERSION_KEY,
  CORE_DM_SPACE
} from '../../data-providers/core-dm-provider/dataModels';
import { type AssetMappedPointCloudAnnotationsDependencies } from './common/types';
import { type PointCloudAnnotationModel } from '../../components/CacheProvider/types';
import { isPointCloudAnnotationModel } from '../../components/CacheProvider/typeGuards';

export async function getAssetsMappedPointCloudAnnotations(
  models: Array<AddPointCloudResourceOptions<ClassicDataSourceType>>,
  filters: AllAssetFilterProps | undefined,
  sdk: CogniteClient,
  fdmSdk?: FdmSDK,
  dependencies: Partial<AssetMappedPointCloudAnnotationsDependencies> = {}
): Promise<AssetInstance[]> {
  const modelIdList = models.map((model) => model.modelId);

  const pointCloudAnnotations = await getPointCloudAnnotations(modelIdList, sdk);
  const classicAssets = await getPointCloudAnnotationClassicInstances(
    pointCloudAnnotations,
    filters,
    sdk,
    dependencies
  );
  const dmsInstances =
    fdmSdk !== undefined
      ? await getPointCloudAnnotationDmInstances(pointCloudAnnotations, fdmSdk)
      : [];

  return [...classicAssets, ...dmsInstances];
}

async function getPointCloudAnnotations(
  modelIdList: number[],
  sdk: CogniteClient
): Promise<PointCloudAnnotationModel[]> {
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

  return annotationArray.flatMap((annotations) => annotations.filter(isPointCloudAnnotationModel));
}

async function getPointCloudAnnotationClassicInstances(
  pointCloudAnnotations: PointCloudAnnotationModel[],
  filters: AllAssetFilterProps | undefined,
  sdk: CogniteClient,
  dependencies: Partial<AssetMappedPointCloudAnnotationsDependencies>
): Promise<Asset[]> {
  const { getAssetsByIds = getAssetsForIds } = dependencies;
  // TODO: Replace the check for assetRef similar to Point Cloud Asset Styling

  const annotationMappingClassic = pointCloudAnnotations
    .map((annotation) => annotation.data.assetRef?.id ?? annotation.data.assetRef?.externalId)
    .filter((annotation): annotation is string | number => annotation !== undefined);

  const uniqueMappingClassicAssetId = uniq(annotationMappingClassic);

  const assetRefs = uniqueMappingClassicAssetId.map(toIdEither);
  return await getAssetsByIds(assetRefs, filters, sdk);
}

async function getPointCloudAnnotationDmInstances(
  pointCloudAnnotations: AnnotationModel[],
  fdmSdk: FdmSDK
): Promise<Array<FdmNode<AssetProperties>>> {
  const annotationMappingDms = pointCloudAnnotations
    .map((annotation) => (annotation.data as AnnotationsBoundingVolume).instanceRef)
    .filter((instanceRef) => instanceRef !== undefined);

  const uniqueMappingDmsInstances = uniqBy(annotationMappingDms, createFdmKey);

  const source: AnnotationsView = {
    externalId: COGNITE_ASSET_VIEW_VERSION_KEY,
    space: CORE_DM_SPACE,
    version: 'v1',
    type: 'view'
  };

  const allResultLists = await fdmSdk.getByExternalIds<AssetProperties>(
    uniqueMappingDmsInstances
      .map((ref) => {
        if (ref.sources.includes(source)) return ref;
        return undefined;
      })
      .filter((ref) => ref !== undefined),
    [source]
  );
  return allResultLists.items.map((item) => ({
    ...item,
    properties: item.properties[CORE_DM_SPACE][COGNITE_ASSET_VIEW_VERSION_KEY]
  }));
}
