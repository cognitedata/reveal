import {
  type ClassicModelIdentifierType,
  type AnyIntersection,
  type ClassicDataSourceType,
  type DMModelIdentifierType,
  type PointCloudIntersection
} from '@cognite/reveal';
import {
  type InstanceReference,
  isClassicModelIdentifier,
  isDMModelIdentifier,
  isDmsInstance,
  isIdEither
} from '../../utilities/instanceIds';

type InstanceData = {
  classicModelIdentifier: ClassicModelIdentifierType | undefined;
  dmsModelUniqueIdentifier: DMModelIdentifierType | undefined;
  reference: InstanceReference | undefined;
};
export function getPointCloudInstanceFromIntersection(
  intersection: AnyIntersection | undefined
): InstanceData | undefined {
  const isPointCloudIntersection = intersection?.type === 'pointcloud';
  if (!isPointCloudIntersection) return undefined;
  const { model, volumeMetadata } = intersection;
  const { modelIdentifier } = model;

  if (isIdEither(volumeMetadata?.assetRef) && isClassicModelIdentifier(modelIdentifier)) {
    return getInstanceData(modelIdentifier, undefined, volumeMetadata?.assetRef);
  }
  if (isDmsInstance(volumeMetadata?.assetRef) && isDMModelIdentifier(modelIdentifier)) {
    return getInstanceData(undefined, modelIdentifier, volumeMetadata?.assetRef);
  }
  if (isClassicModelIdentifier(modelIdentifier) && isInstanceRefUnderVolumeMetadata(intersection)) {
    return getInstanceData(modelIdentifier, undefined, intersection.volumeMetadata?.instanceRef);
  }
  return undefined;
}

function getInstanceData(
  classic: ClassicModelIdentifierType | undefined,
  dms: DMModelIdentifierType | undefined,
  reference: InstanceReference | undefined
): InstanceData {
  return {
    classicModelIdentifier: classic,
    dmsModelUniqueIdentifier: dms,
    reference
  };
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
