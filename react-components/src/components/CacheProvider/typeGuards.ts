import { type PointCloudAnnotationModel } from './types';

export function isPointCloudAnnotationModel(
  annotationModel: unknown
): annotationModel is PointCloudAnnotationModel {
  return (
    typeof annotationModel === 'object' &&
    annotationModel !== null &&
    'data' in annotationModel &&
    annotationModel.data !== null &&
    typeof annotationModel.data === 'object' &&
    'region' in annotationModel.data &&
    ('assetRef' in annotationModel.data || 'instanceRef' in annotationModel.data)
  );
}
