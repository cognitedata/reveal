import isFinite from 'lodash-es/isFinite';
import { RegionShape } from 'src/api/annotation/types';
import { uniqueVertices, vertexIsNormalized } from 'src/api/utils/regionUtils';
import { LegacyAnnotation } from './legacyTypes';

export function validBoundingBox(annotationV1: LegacyAnnotation) {
  return (
    !!annotationV1.region &&
    annotationV1.region.shape === RegionShape.Rectangle &&
    annotationV1.region.vertices?.length === 2 &&
    annotationV1.region.vertices.every(
      (item) => 'x' in item && 'y' in item && vertexIsNormalized(item)
    ) &&
    uniqueVertices(annotationV1.region.vertices)
  );
}

export function validPolygon(annotationV1: LegacyAnnotation) {
  return (
    !!annotationV1.region &&
    annotationV1.region.shape === RegionShape.Polygon &&
    annotationV1.region.vertices?.length >= 3 &&
    annotationV1.region.vertices.every(
      (item) => 'x' in item && 'y' in item && vertexIsNormalized(item)
    ) &&
    uniqueVertices(annotationV1.region.vertices)
  );
}

export function validPolyline(annotationV1: LegacyAnnotation) {
  return (
    !!annotationV1.region &&
    annotationV1.region.shape === RegionShape.Polyline &&
    annotationV1.region.vertices?.length >= 2 &&
    annotationV1.region.vertices.every(
      (item) => 'x' in item && 'y' in item && vertexIsNormalized(item)
    ) &&
    uniqueVertices(annotationV1.region.vertices)
  );
}

export function validImageAssetLink(annotationV1: LegacyAnnotation) {
  if (
    !(
      annotationV1.linkedResourceId && isFinite(annotationV1.linkedResourceId)
    ) &&
    !annotationV1.linkedResourceExternalId
  ) {
    return false;
  }
  return (
    validBoundingBox(annotationV1) &&
    annotationV1.linkedResourceType === 'asset'
  );
}

export function validKeypointCollection(annotationV1: LegacyAnnotation) {
  if (
    !annotationV1.data ||
    !annotationV1.data.keypoint ||
    !annotationV1.data.keypoints ||
    !annotationV1.data?.keypoints?.length
  ) {
    return false;
  }

  const annotation = annotationV1;
  return (
    !!annotation.region &&
    annotation.region.shape === RegionShape.Points &&
    annotation.region.vertices?.length === annotation.data?.keypoints?.length &&
    annotation.region.vertices.every(
      (item) => 'x' in item && 'y' in item && vertexIsNormalized(item)
    ) &&
    uniqueVertices(annotation.region.vertices)
  );
}
