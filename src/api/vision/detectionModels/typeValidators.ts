import { RegionShape } from 'src/api/annotation/types';
import {
  TagDetectionJobAnnotation,
  Vertex,
  VisionJobAnnotation,
} from './types';

export function vertexIsNormalized(vertex: Vertex) {
  return vertex.x >= 0 && vertex.x <= 1 && vertex.y >= 0 && vertex.y <= 1;
}

export function validBoundingBox(visionJobAnnotation: VisionJobAnnotation) {
  return (
    !!visionJobAnnotation.region &&
    visionJobAnnotation.region.shape === RegionShape.Rectangle &&
    Array.isArray(visionJobAnnotation.region.vertices) &&
    visionJobAnnotation.region.vertices.length === 2 &&
    visionJobAnnotation.region.vertices.every(
      (item) => 'x' in item && 'y' in item && vertexIsNormalized(item)
    )
  );
}

export function validImageAssetLink(visionJobAnnotation: VisionJobAnnotation) {
  return (
    validBoundingBox(visionJobAnnotation) &&
    !!(visionJobAnnotation as TagDetectionJobAnnotation).assetIds
  );
}
