import { type AnnotationsAssetRef, type IdEither } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../../data-providers';
import {
  type AnyIntersection,
  type ClassicDataSourceType,
  type DMInstanceRef,
  type DMModelIdentifierType,
  type PointCloudIntersection
} from '@cognite/reveal';
import { isDmsInstance } from '../../utilities/instanceIds';
import { toIdEither } from '../../utilities/instanceIds/toIdEither';

type InstanceData = {
  classicModelIdentifier: { modelId: number; revisionId: number } | undefined;
  dmsModelUniqueIdentifier: DMModelIdentifierType | undefined;
  reference: IdEither | DmsUniqueIdentifier | undefined;
};
export function getInstanceDataFromIntersection(
  intersection: AnyIntersection | undefined
): InstanceData | undefined {
  const emptyResult = {
    classicModelIdentifier: undefined,
    dmsModelUniqueIdentifier: undefined,
    reference: undefined
  };
  const isPointCloudIntersection = intersection?.type === 'pointcloud';
  if (!isPointCloudIntersection) return emptyResult;

  const classicIdEither = extractClassicIdEitherFromAssetRef(intersection.volumeMetadata?.assetRef);

  if (classicIdEither && 'modelId' in intersection.model.modelIdentifier) {
    return {
      classicModelIdentifier: intersection.model.modelIdentifier,
      dmsModelUniqueIdentifier: undefined,
      reference: classicIdEither
    };
  } else if (isDmsInstance(intersection.volumeMetadata?.assetRef) && 'revisionExternalId' in intersection.model.modelIdentifier) {
    return {
      classicModelIdentifier: undefined,
      dmsModelUniqueIdentifier: intersection.model.modelIdentifier,
      reference: intersection.volumeMetadata?.assetRef
    };
  } else if (!classicIdEither && 'modelId' in intersection.model.modelIdentifier) {
    const instanceRef = isInstanceRefUnderVolumeMetadata(intersection)
      ? intersection.volumeMetadata?.instanceRef
      : undefined;
    return {
      classicModelIdentifier: intersection.model.modelIdentifier,
      dmsModelUniqueIdentifier: undefined,
      reference: instanceRef
    };
  }
  return emptyResult;
}

function extractClassicIdEitherFromAssetRef(
  assetRef: AnnotationsAssetRef | DMInstanceRef | undefined
): IdEither | undefined {
  const classicReference = !isDmsInstance(assetRef)
    ? (assetRef?.externalId ?? assetRef?.id)
    : undefined;

  const classicIdEither = classicReference ? toIdEither(classicReference) : undefined;
  return classicIdEither;
}

function isInstanceRefUnderVolumeMetadata(
  intersection: AnyIntersection | undefined
): intersection is PointCloudIntersection<ClassicDataSourceType> {
  return (
    intersection?.type === 'pointcloud' &&
    intersection.volumeMetadata !== undefined &&
    'instanceRef' in intersection.volumeMetadata &&
    isDmsInstance(intersection.volumeMetadata.instanceRef)
  );
}
