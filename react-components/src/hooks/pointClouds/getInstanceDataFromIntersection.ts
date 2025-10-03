import { type IdEither } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../../data-providers';
import {
  type AnyIntersection,
  type ClassicDataSourceType,
  type DMModelIdentifierType,
  type PointCloudIntersection
} from '@cognite/reveal';
import {
  isClassicModelIdentifier,
  isDMModelIdentifier,
  isDmsInstance,
  isIdEither
} from '../../utilities/instanceIds';

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

  if (isIdEither(intersection.volumeMetadata?.assetRef) && isClassicModelIdentifier(intersection.model.modelIdentifier)) {
    return {
      classicModelIdentifier: intersection.model.modelIdentifier,
      dmsModelUniqueIdentifier: undefined,
      reference: intersection.volumeMetadata?.assetRef
    };
  } else if (
    isDmsInstance(intersection.volumeMetadata?.assetRef) &&
    isDMModelIdentifier(intersection.model.modelIdentifier)
  ) {
    return {
      classicModelIdentifier: undefined,
      dmsModelUniqueIdentifier: intersection.model.modelIdentifier,
      reference: intersection.volumeMetadata?.assetRef
    };
  } else if (
    isClassicModelIdentifier(intersection.model.modelIdentifier) &&
    isInstanceRefUnderVolumeMetadata(intersection)
  ) {
    const referenceData = intersection.volumeMetadata?.instanceRef;
    const reference = isDmsInstance(referenceData)
      ? { space: referenceData.space, externalId: referenceData.externalId }
      : undefined;
    return {
      classicModelIdentifier: intersection.model.modelIdentifier,
      dmsModelUniqueIdentifier: undefined,
      reference: reference
    };
  }
  return emptyResult;
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
