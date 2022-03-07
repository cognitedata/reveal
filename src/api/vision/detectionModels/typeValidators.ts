import {
  GaugeReaderJobAnnotation,
  TagDetectionJobAnnotation,
  VisionJobAnnotation,
} from './types';

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

export function validKeypointCollection(
  visionJobAnnotation: VisionJobAnnotation
) {
  if (!(visionJobAnnotation as GaugeReaderJobAnnotation).data) {
    return false;
  }

  const annotation = visionJobAnnotation as GaugeReaderJobAnnotation;
  return (
    !!annotation.region &&
    annotation.region.shape === 'points' &&
    annotation.region.vertices.length ===
      annotation.data.keypoint_names.length &&
    annotation.region.vertices.every((item) => 'x' in item && 'y' in item)
  );
}
