import {
  type AnnotationsTypesImagesAssetLink,
  type AnnotationModel,
  type AnnotationsBoundingVolume,
  type IdEither
} from '@cognite/sdk';

import {
  isClassicPointCloudVolume,
  isDMPointCloudVolume,
  type PointCloudObjectMetadata,
  type DataSourceType
} from '@cognite/reveal';
import { type InstanceReference, isDmsInstance, isIdEither } from '../../utilities/instanceIds';
import {
  createInstanceReferenceKey,
  type InstanceReferenceKey
} from '../../utilities/instanceIds/toKey';
import { createFdmKey } from './idAndKeyTranslation';
import { type PointCloudVolumeId } from './types';
import {
  isClassicImage360AssetAnnotationData,
  isDMImage360Annotation,
  isHybridImage360AssetAnnotationData
} from '../../utilities/image360Annotations';

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

export function getPointCloudVolumeId(
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
  if (isDMImage360Annotation(annotation)) {
    // CoreDM Image360 Annotation
    return annotation.assetRef;
  } else {
    // Annotation Model - hybrid or classic
    if (isHybridImage360AssetAnnotationData(annotation.data)) {
      return annotation.data.instanceRef;
    }

    if (isClassicImage360AssetAnnotationData(annotation.data)) {
      const assetRef = annotation.data.assetRef;
      return assetRef !== undefined && isIdEither(assetRef as IdEither)
        ? (assetRef as IdEither)
        : undefined;
    }
    return undefined;
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
  if (isDMImage360Annotation(annotation)) {
    return createFdmKey(annotation.annotationIdentifier);
  } else {
    return annotation.id;
  }
}
