import { type AnnotationModel } from '@cognite/sdk';

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
