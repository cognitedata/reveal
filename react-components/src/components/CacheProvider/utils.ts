import {
  type AnnotationsTypesImagesAssetLink,
  type AnnotationModel,
  type AnnotationsBoundingVolume,
  type IdEither
} from '@cognite/sdk';

import {
  isClassicPointCloudVolume,
  isDMPointCloudVolume,
  PointCloudObjectMetadata,
  type CoreDmImage360Annotation,
  type DataSourceType
} from '@cognite/reveal';
import { type InstanceReference, isDmsInstance, isIdEither } from '../../utilities/instanceIds';
import {
  createInstanceReferenceKey,
  type InstanceReferenceKey
} from '../../utilities/instanceIds/toKey';
import { createFdmKey } from './idAndKeyTranslation';
import { PointCloudVolumeId } from './types';

export function getInstanceReferencesFromPointCloudAnnotation(
  annotation: AnnotationModel
): InstanceReference[] {
  const annotationData = annotation.data as AnnotationsBoundingVolume;

  const instances: InstanceReference[] = [];

  if (annotationData.assetRef !== undefined && isIdEither(annotationData.assetRef)) {
    instances.push(annotationData.assetRef);
  }
  if (annotationData.instanceRef !== undefined && isDmsInstance(annotationData.instanceRef)) {
    const dmsUniqueIdentifierFromInstanceRef: InstanceReference = {
      space: annotationData.instanceRef.space,
      externalId: annotationData.instanceRef.externalId
    };
    instances.push(dmsUniqueIdentifierFromInstanceRef);
  }

  return instances;
}

export function getInstanceReferencesFromPointCloudVolume(
  volume: PointCloudObjectMetadata<DataSourceType>
): InstanceReference[] {
  const instances: InstanceReference[] = [];

  if (isClassicPointCloudVolume(volume)) {
    if (isIdEither(volume.assetRef)) {
      instances.push(volume.assetRef);
    }

    if (isDmsInstance(volume.instanceRef)) {
      instances.push(volume.instanceRef);
    }
  }
  if (isDMPointCloudVolume(volume) && volume.assetRef !== undefined) {
    instances.push(volume.assetRef);
  }

  return instances;
}

export function getVolumeAnnotationId(
  volume: PointCloudObjectMetadata<DataSourceType>
): PointCloudVolumeId {
  if (isClassicPointCloudVolume(volume)) {
    return volume.annotationId;
  } else {
    return volume.volumeInstanceRef;
  }
}

export function getInstanceReferenceFromImage360Annotation(
  annotation: DataSourceType['image360AnnotationType']
): InstanceReference | undefined {
  if (isCoreDmImage360Annotation(annotation)) {
    return annotation.assetRef;
  } else {
    const annotationData = annotation.data as AnnotationsTypesImagesAssetLink;
    const assetRef = annotationData.assetRef;
    return assetRef !== undefined && isIdEither(assetRef as IdEither)
      ? (assetRef as IdEither)
      : undefined;
  }
}

export function getAssetIdKeyForImage360Annotation(
  annotation: DataSourceType['image360AnnotationType']
): InstanceReferenceKey | undefined {
  const instanceRef = getInstanceReferenceFromImage360Annotation(annotation);
  if (instanceRef === undefined) {
    return undefined;
  }
  return createInstanceReferenceKey(instanceRef);
}

export function getIdKeyForImage360Annotation(
  annotation: DataSourceType['image360AnnotationType']
): string | number {
  if (isCoreDmImage360Annotation(annotation)) {
    return createFdmKey(annotation.annotationIdentifier);
  } else {
    return annotation.id;
  }
}

// TODO: Implement this in Reveal instead
function isCoreDmImage360Annotation(
  annotation: DataSourceType['image360AnnotationType']
): annotation is CoreDmImage360Annotation {
  return (annotation as CoreDmImage360Annotation).annotationIdentifier?.externalId !== undefined;
}
