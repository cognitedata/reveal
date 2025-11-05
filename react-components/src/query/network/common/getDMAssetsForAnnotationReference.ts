import type { AnnotationsInstanceRef, CogniteClient } from '@cognite/sdk';
import { uniqBy } from 'lodash-es';
import { FdmNode, FdmSDK } from '../../../data-providers/FdmSDK';
import { AssetProperties } from '../../../data-providers/core-dm-provider/utils/filters';
import { createFdmKey } from '../../../components';
import { COGNITE_ASSET_SOURCE, COGNITE_ASSET_VIEW_VERSION_KEY, CORE_DM_SPACE } from '../../../data-providers/core-dm-provider/dataModels';

export async function getDMAssetsForAnnotationReference(
  annotationInstanceRefs: AnnotationsInstanceRef[],
  sdk: CogniteClient
): Promise<Array<FdmNode<AssetProperties>>> {
  if (annotationInstanceRefs.length === 0) {
    return [];
  }
  const fdmSdk = new FdmSDK(sdk);
  return await getDmInstancesFromAnnotation(annotationInstanceRefs, fdmSdk);
}
async function getDmInstancesFromAnnotation(
  annotationInstanceRefs: AnnotationsInstanceRef[],
  fdmSdk: FdmSDK
): Promise<Array<FdmNode<AssetProperties>>> {
  const uniqueMappingDmsInstances = uniqBy<AnnotationsInstanceRef>(
    annotationInstanceRefs,
    createFdmKey
  );

  const allResultLists = await fdmSdk.getByExternalIds<AssetProperties>(
    uniqueMappingDmsInstances.filter((instance) =>
      instance.sources.some(
        (instanceSource) =>
          instanceSource.externalId === COGNITE_ASSET_SOURCE.externalId &&
          instanceSource.space === COGNITE_ASSET_SOURCE.space &&
          instanceSource.version === COGNITE_ASSET_SOURCE.version
      )
    ),
    [COGNITE_ASSET_SOURCE]
  );
  return allResultLists.items.map((item) => ({
    ...item,
    properties: item.properties[CORE_DM_SPACE][COGNITE_ASSET_VIEW_VERSION_KEY]
  }));
}

