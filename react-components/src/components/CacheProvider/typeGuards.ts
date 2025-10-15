import { type AnnotationModel } from '@cognite/sdk';
import { type PointCloudVolumeId, type PointCloudAnnotationModel } from './types';
import { createFdmKey } from './idAndKeyTranslation';

export function isPointCloudAnnotationModel(
  annotationModel: AnnotationModel
): annotationModel is PointCloudAnnotationModel {
  return (
    typeof annotationModel === 'object' &&
    annotationModel !== null &&
    annotationModel.data !== null &&
    typeof annotationModel.data === 'object' &&
    'region' in annotationModel.data
  );
}

export function createPointCloudVolumeIdKey(id: PointCloudVolumeId): string {
  if (typeof id === 'number') {
    return String(id);
  } else {
    return createFdmKey(id);
  }
}
