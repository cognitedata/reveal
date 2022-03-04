import { TagDetectionJobAnnotation, VisionJobAnnotation } from './types';

export function validBoundingBox(visionJobAnnotation: VisionJobAnnotation) {
  return (
    !!visionJobAnnotation.region &&
    visionJobAnnotation.region.shape === 'rectangle' &&
    visionJobAnnotation.region.vertices.length === 2 &&
    visionJobAnnotation.region.vertices.every(
      (item) => 'x' in item && 'y' in item
    )
  );
}

export function validImageAssetLink(visionJobAnnotation: VisionJobAnnotation) {
  return (
    validBoundingBox(visionJobAnnotation) &&
    !!(visionJobAnnotation as TagDetectionJobAnnotation).assetIds
  );
}
