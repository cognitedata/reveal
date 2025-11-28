import { type CogniteClient, type Asset, type IdEither } from '@cognite/sdk';
import { uniqBy, chunk, uniqWith } from 'lodash-es';
import { isDefined } from '../../utilities/isDefined';
import { type AnnotationId, type PointCloudAnnotationModel } from './types';
import { getInstanceReferencesFromPointCloudAnnotation } from './utils';
import { type AssetProperties } from '../../data-providers/core-dm-provider/utils/filters';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { type FdmNode, FdmSDK } from '../../data-providers/FdmSDK';
import {
  COGNITE_ASSET_SOURCE,
  COGNITE_ASSET_VIEW_VERSION_KEY,
  CORE_DM_SPACE
} from '../../data-providers/core-dm-provider/dataModels';
import {
  createInstanceReferenceKey,
  type InstanceReference,
  type InstanceReferenceKey,
  isDmsInstance,
  isIdEither
} from '../../utilities/instanceIds';
import { isSameIdEither } from '../../utilities/instanceIds/equality';
import { type AssetInstance } from '../../utilities/instances';
import { concatenateMapValues } from '../../utilities/map/concatenateMapValues';

export async function fetchPointCloudAnnotationAssets(
  annotations: PointCloudAnnotationModel[],
  sdk: CogniteClient
): Promise<Map<AnnotationId, AssetInstance[]>> {
  const annotationMappings = annotations
    .flatMap((annotation) =>
      getInstanceReferencesFromPointCloudAnnotation(annotation).map((assetId) => ({
        annotationId: annotation.id,
        assetId
      }))
    )
    .filter(isDefined);

  const uniqueAssetIds = uniqBy(
    annotationMappings.map((mapping) => mapping.assetId),
    createInstanceReferenceKey
  );

  const assets = await fetchAssetsForAssetReferences(uniqueAssetIds, sdk);

  const instanceKeyToInstanceMap = new Map<InstanceReferenceKey, AssetInstance>(
    assets.map((asset) => [createInstanceReferenceKey(asset), asset])
  );

  return concatenateMapValues(
    annotationMappings
      .map((mapping) => {
        const instanceKey = createInstanceReferenceKey(mapping.assetId);
        const correspondingAsset = instanceKeyToInstanceMap.get(instanceKey);
        if (correspondingAsset === undefined) {
          return undefined;
        }
        return [mapping.annotationId, correspondingAsset] as const;
      })
      .filter(isDefined)
  );
}

export async function fetchAssetsForAssetReferences(
  assetIds: InstanceReference[],
  sdk: CogniteClient
): Promise<AssetInstance[]> {
  const classicIds = assetIds.filter(isIdEither);
  const dmIds = assetIds.filter(isDmsInstance);
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
