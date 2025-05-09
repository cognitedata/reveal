/*!
 * Copyright 2024 Cognite AS
 */
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
import {
  type InstanceReference,
  isAssetInstanceReference,
  isDmsInstance,
  isHybridAssetMappingsInstance,
  isIdEither
} from '../../utilities/instanceIds';
import { isSameIdEither } from '../../utilities/instanceIds/equality';
import { type AssetInstance } from '../../utilities/instances';

export async function fetchPointCloudAnnotationAssets(
  annotations: PointCloudAnnotationModel[],
  sdk: CogniteClient
): Promise<Map<AnnotationId, Asset>> {
  const annotationMapping = annotations.map((annotation) => {
    const assetId = getInstanceReferenceFromPointCloudAnnotation(annotation);
    if (assetId === undefined) {
      return undefined;
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
  const assets = await fetchAssetsForAssetIds(assetIds, sdk);

  const annotationIdToAssetMap = new Map<number, Asset>();
  assets.forEach((asset) => {
    filteredAnnotationMapping.forEach((mapping) => {
      if (isSameIdEither(mapping.assetId, asset)) {
        annotationIdToAssetMap.set(mapping.annotationId, asset);
      }
    });
  });
  return annotationIdToAssetMap;
}

export async function fetchAssetsForAssetReferences(
  assetIds: InstanceReference[],
  sdk: CogniteClient,
  fdmSdk: FdmSDK
): Promise<AssetInstance[]> {
  const classicAssetIds = assetIds.filter(isIdEither);
  const dmIds = assetIds.filter(isDmsInstance);
  const assetIdReferences = assetIds.filter(isAssetInstanceReference);
  const hybridAssetIdReferences = assetIds.filter(isHybridAssetMappingsInstance);

  const classicIdReferences = classicAssetIds.concat(
    assetIdReferences.map((id) => {
      return { id: id.assetId };
    })
  );
  const dmIdReferences = dmIds.concat(hybridAssetIdReferences.map((id) => id.assetInstanceId));
  return ([] as AssetInstance[])
    .concat(await fetchAssetsForAssetIds(classicIdReferences, sdk))
    .concat(await fetchAssetsForDmsIds(dmIdReferences, fdmSdk));
}

async function fetchAssetsForDmsIds(
  dmsIds: DmsUniqueIdentifier[],
  fdmSdk: FdmSDK
): Promise<Array<FdmNode<AssetProperties>>> {
  if (dmsIds.length === 0) {
    return [];
  }

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
