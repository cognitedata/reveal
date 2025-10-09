import { type IdEither } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../../data-providers';
import {
  type ClassicModelIdentifierType,
  type AnyIntersection,
  type ClassicDataSourceType,
  type PointCloudIntersection
} from '@cognite/reveal';
import { isClassicModelIdentifier, isDmsInstance, isIdEither } from '../../utilities/instanceIds';

type InstanceData = {
  classicModelIdentifier: ClassicModelIdentifierType;
  reference: IdEither | DmsUniqueIdentifier | undefined;
};
export function getPointCloudInstanceFromIntersection(
  intersection: AnyIntersection | undefined
): InstanceData | undefined {
  const isPointCloudIntersection = intersection?.type === 'pointcloud';
  if (!isPointCloudIntersection) return undefined;
  const { model, volumeMetadata } = intersection;
  const { modelIdentifier } = model;

  if (isIdEither(volumeMetadata?.assetRef) && isClassicModelIdentifier(modelIdentifier)) {
    return getInstanceData(modelIdentifier, volumeMetadata.assetRef);
  }
  if (isClassicModelIdentifier(modelIdentifier) && isInstanceRefUnderVolumeMetadata(intersection)) {
    return getInstanceData(modelIdentifier, intersection.volumeMetadata?.instanceRef);
  }
  return undefined;
}

function getInstanceData(
  classic: ClassicModelIdentifierType,
  reference: IdEither | DmsUniqueIdentifier | undefined
): InstanceData {
  return {
    classicModelIdentifier: classic,
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
