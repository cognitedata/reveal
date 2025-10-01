import { type CogniteClient, type Asset, type IdEither } from '@cognite/sdk';
import { uniqBy, chunk, partition, uniqWith } from 'lodash';
import { isDefined } from '../../utilities/isDefined';
import { type AnnotationId, type PointCloudAnnotationModel } from './types';
import { getInstanceReferenceFromPointCloudAnnotation } from './utils';
import { type AssetProperties } from '../../data-providers/core-dm-provider/utils/filters';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { type FdmNode, FdmSDK } from '../../data-providers/FdmSDK';
import {
  COGNITE_ASSET_SOURCE,
  COGNITE_ASSET_VIEW_VERSION_KEY,
  CORE_DM_SPACE
} from '../../data-providers/core-dm-provider/dataModels';
import { type InstanceReference, isDmsInstance, isIdEither } from '../../utilities/instanceIds';
import { isSameDmsId, isSameIdEither } from '../../utilities/instanceIds/equality';
import { type AssetInstance } from '../../utilities/instances';

export async function fetchPointCloudAnnotationAssets(
  annotations: PointCloudAnnotationModel[],
  sdk: CogniteClient
): Promise<Map<AnnotationId, AssetInstance>> {
  const annotationMapping = annotations.map((annotation) => {
    const assetId = getInstanceReferenceFromPointCloudAnnotation(annotation);
    if (assetId === undefined) {
      return undefined;
    }
    if (isDmsInstance(assetId)) {
      return {
        annotationId: annotation.id,
        assetId: { externalId: assetId.externalId, space: assetId.space }
      };
    }
    return {
      annotationId: annotation.id,
      assetId
    };
  });
  const filteredAnnotationMapping = annotationMapping.filter(isDefined);

  const uniqueAnnotationMapping = uniqBy(
    filteredAnnotationMapping,
    (annotationMapping) => annotationMapping.assetId
  );
  const assetIds = uniqueAnnotationMapping.map((mapping) => mapping.assetId);
  const assets = await fetchAssetsForAssetReferences(assetIds, sdk);

  const annotationIdToAssetMap = new Map<number, AssetInstance>();
  assets.forEach((asset) => {
    filteredAnnotationMapping.forEach((mapping) => {
      if (isDmsInstance(mapping.assetId) && isDmsInstance(asset)) {
        if (isSameDmsId(mapping.assetId, asset)) {
          annotationIdToAssetMap.set(mapping.annotationId, asset);
        }
      } else if (isIdEither(mapping.assetId) && isIdEither(asset)) {
        if (isSameIdEither(mapping.assetId, asset)) {
          annotationIdToAssetMap.set(mapping.annotationId, asset);
        }
      }
    });
  });
  return annotationIdToAssetMap;
}

export async function fetchAssetsForAssetReferences(
  assetIds: InstanceReference[],
  sdk: CogniteClient
): Promise<AssetInstance[]> {
  const [classicIds, dmIds] = partition(assetIds, isIdEither);
  return ([] as AssetInstance[])
    .concat(await fetchAssetsForAssetIds(classicIds, sdk))
    .concat(await fetchAssetsForDmsIds(dmIds, sdk));
}

async function fetchAssetsForDmsIds(
  dmsIds: DmsUniqueIdentifier[],
  sdk: CogniteClient
): Promise<Array<FdmNode<AssetProperties>>> {
  if (dmsIds.length === 0) {
    return [];
  }

  const fdmSdk = new FdmSDK(sdk);

  const response = await fdmSdk.getByExternalIds<AssetProperties>(
    dmsIds.map((id) => ({ ...id, instanceType: 'node' as const })),
    [COGNITE_ASSET_SOURCE]
  );

  return response.items.map((item) => ({
    ...item,
    properties: item.properties[CORE_DM_SPACE][COGNITE_ASSET_VIEW_VERSION_KEY]
  }));
}

export async function fetchAssetsForAssetIds(
  assetIds: IdEither[],
  sdk: CogniteClient
): Promise<Asset[]> {
  const uniqueAssetIds = uniqWith(assetIds, isSameIdEither);
  const assetsResult = await Promise.all(
    chunk(uniqueAssetIds, 1000).map(async (assetIdsChunck) => {
      const retrievedAssets = await sdk.assets.retrieve(assetIdsChunck, { ignoreUnknownIds: true });
      return retrievedAssets;
    })
  );

  return assetsResult.flat();
}
