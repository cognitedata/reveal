import { RegionShape } from '@vision/api/annotation/types';
import isFinite from 'lodash/isFinite';

import {
  GaugeReaderJobAnnotation,
  TagDetectionJobAnnotation,
  Vertex,
  VisionJobAnnotation,
} from './types';

export function vertexIsNormalized(vertex: Vertex) {
  return vertex.x >= 0 && vertex.x <= 1 && vertex.y >= 0 && vertex.y <= 1;
}

export function uniqueVertices(vertices: Vertex[]) {
  const uniqueVerticesList = [
    ...new Map(
      vertices.map((vertex) => [[vertex.x, vertex.y].join('|'), vertex])
    ).values(),
  ];

  return uniqueVerticesList.length === vertices.length;
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
    (visionJobAnnotation as TagDetectionJobAnnotation).assetIds.every((item) =>
      isFinite(item)
    )
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
    annotation.region.shape === RegionShape.Points &&
    annotation.region.vertices?.length ===
      annotation.data.keypointNames?.length &&
    annotation.region.vertices.every(
      (item) => 'x' in item && 'y' in item && vertexIsNormalized(item)
    ) &&
    uniqueVertices(annotation.region.vertices)
  );
}
