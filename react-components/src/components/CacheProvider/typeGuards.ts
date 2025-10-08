import { type AnnotationModel } from '@cognite/sdk';
import { type PointCloudAnnotationModel } from './types';

export function isPointCloudAnnotationModel(
  annotationModel: AnnotationModel
): annotationModel is PointCloudAnnotationModel {
  return (
    typeof annotationModel === 'object' &&
    annotationModel !== null &&
    'data' in annotationModel &&
    annotationModel.data !== null &&
    typeof annotationModel.data === 'object' &&
    'region' in annotationModel.data
  );
}
