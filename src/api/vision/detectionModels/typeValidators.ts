import { RegionShape } from 'src/api/annotation/types';
import {
  TagDetectionJobAnnotation,
  Vertex,
  VisionJobAnnotation,
} from './types';

export function vertexIsNormalized(vertex: Vertex) {
  return vertex.x >= 0 && vertex.x <= 1 && vertex.y >= 0 && vertex.y <= 1;
}

export function uniqueVertices(vertices: Vertex[]) {
  const uniqueVertices = [
    ...new Map(
      vertices.map((vertex) => [[vertex.x, vertex.y].join('|'), vertex])
    ).values(),
  ];

  return uniqueVertices.length === vertices.length;
}

export function validBoundingBox(visionJobAnnotation: VisionJobAnnotation) {
  return (
    !!visionJobAnnotation.region &&
    visionJobAnnotation.region.shape === RegionShape.Rectangle &&
    visionJobAnnotation.region.vertices?.length === 2 &&
    visionJobAnnotation.region.vertices.every(
      (item) => 'x' in item && 'y' in item && vertexIsNormalized(item)
    ) &&
    uniqueVertices(visionJobAnnotation.region.vertices)
  );
}

export function validImageAssetLink(visionJobAnnotation: VisionJobAnnotation) {
  return (
    validBoundingBox(visionJobAnnotation) &&
    !!(visionJobAnnotation as TagDetectionJobAnnotation).assetIds &&
    !!(visionJobAnnotation as TagDetectionJobAnnotation).assetIds?.length &&
    (visionJobAnnotation as TagDetectionJobAnnotation).assetIds.every(
      (item) => item !== null && item !== undefined
    )
  );
}
