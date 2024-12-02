/*!
 * Copyright 2024 Cognite AS
 */

import {
  type CadIntersection,
  type ClassicDataSourceType,
  type DataSourceType,
  type DMDataSourceType,
  type PointCloudIntersection
} from '@cognite/reveal';
import { type InstanceReference } from '../data-providers';
import { type CdfCaches } from '../architecture/base/renderTarget/CdfCaches';
import { fetchAncestorNodesForTreeIndex } from '../components/CacheProvider/requests';
import { EMPTY_ARRAY } from './constants';
import { fetchAnnotationsForModel } from '../hooks/pointClouds/fetchAnnotationsForModel';
import { isDMIdentifier } from '../components';
import { is360ImageAnnotation } from './is360ImageAnnotation';
import { type RevealRenderTarget } from '../architecture';

export async function getInstancesFromClick(
  renderTarget: RevealRenderTarget,
  event: PointerEvent
): Promise<InstanceReference[] | undefined> {
  const viewer = renderTarget.viewer;
  const caches = renderTarget.cdfCaches;
  const coreDmOnly = caches.coreDmOnly;

  const pixelCoordinates = viewer.getPixelCoordinatesFromEvent(event);
  const intersection = await viewer.getAnyIntersectionFromPixel(pixelCoordinates);
  const image360AnnotationIntersection = await viewer.get360AnnotationIntersectionFromPixel(
    event.offsetX,
    event.offsetY
  );

  const image360AnnotationData = image360AnnotationIntersection?.annotation.annotation.data;
  const has360Asset =
    image360AnnotationData !== undefined && is360ImageAnnotation(image360AnnotationData);

  if (!coreDmOnly && has360Asset && image360AnnotationData.assetRef.id !== undefined) {
    return [{ assetId: image360AnnotationData.assetRef.id }];
  }

  if (intersection === undefined) {
    return undefined;
  }

  if (intersection.type === 'cad') {
    return await getInstancesFromCadIntersection(intersection, caches);
  } else if (intersection.type === 'pointcloud') {
    return await getInstancesFromPointCloudIntersection(intersection, caches);
  }

  return undefined;
}

async function getInstancesFromPointCloudIntersection(
  intersection: PointCloudIntersection<DataSourceType>,
  caches: CdfCaches
): Promise<InstanceReference[]> {
  if (isDMIdentifier(intersection.model.modelIdentifier)) {
    return getPointCloudFdmInstancesFromIntersection(
      intersection as PointCloudIntersection<DMDataSourceType>
    );
  } else {
    return await getPointCloudAnnotationMappingsFromIntersection(
      intersection as PointCloudIntersection<ClassicDataSourceType>,
      caches
    );
  }
}

async function getPointCloudAnnotationMappingsFromIntersection(
  intersection: PointCloudIntersection,
  caches: CdfCaches
): Promise<InstanceReference[]> {
  if (caches.coreDmOnly) {
    return [];
  }

  if (intersection.volumeMetadata?.assetRef?.id !== undefined) {
    return [{ assetId: intersection.volumeMetadata.assetRef.id }];
  }
  const assetExternalId = intersection.volumeMetadata?.assetRef?.externalId;

  if (assetExternalId === undefined) {
    return [];
  }

  const annotations = await fetchAnnotationsForModel(
    intersection.model.modelIdentifier.modelId,
    intersection.model.modelIdentifier.revisionId,
    [assetExternalId],
    caches.pointCloudAnnotationCache
  );

  return annotations?.map((annotation) => ({ assetId: annotation.asset.id })) ?? EMPTY_ARRAY;
}

function getPointCloudFdmInstancesFromIntersection(
  intersection: PointCloudIntersection<DMDataSourceType>
): InstanceReference[] {
  return intersection.volumeMetadata?.assetRef === undefined
    ? EMPTY_ARRAY
    : [intersection.volumeMetadata.assetRef];
}

async function getInstancesFromCadIntersection(
  intersection: CadIntersection,
  caches: CdfCaches
): Promise<InstanceReference[]> {
  const fdmDataPromise = getCadFdmDataPromise(intersection, caches);

  const assetMappingPromise = getAssetMappingPromise(intersection, caches);

  const [fdmData, assetMapping] = await Promise.all([fdmDataPromise, assetMappingPromise] as const);
  return [...fdmData, ...assetMapping];
}

async function getCadFdmDataPromise(
  intersection: CadIntersection,
  caches: CdfCaches
): Promise<InstanceReference[]> {
  const fdmNodeDataPromises = caches.fdmNodeCache.getClosestParentDataPromises(
    intersection.model.modelId,
    intersection.model.revisionId,
    intersection.treeIndex
  );

  return (await fdmNodeDataPromises.cadAndFdmNodesPromise)?.fdmIds ?? EMPTY_ARRAY;
}

async function getAssetMappingPromise(
  intersection: CadIntersection,
  caches: CdfCaches
): Promise<InstanceReference[]> {
  if (caches.coreDmOnly) {
    return [];
  }

  const ancestors = await fetchAncestorNodesForTreeIndex(
    intersection.model.modelId,
    intersection.model.revisionId,
    intersection.treeIndex,
    caches.cogniteClient
  );

  const nodeAssetResult = await caches.assetMappingAndNode3dCache.getAssetMappingsForLowestAncestor(
    intersection.model.modelId,
    intersection.model.revisionId,
    ancestors
  );

  return nodeAssetResult.mappings.map((mapping) => ({ assetId: mapping.assetId }));
}
