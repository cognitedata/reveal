import isFinite from 'lodash-es/isFinite';
import { CDFAnnotationV1, RegionShape } from 'src/api/annotation/types';
import { uniqueVertices, vertexIsNormalized } from 'src/api/utils/regionUtils';

export function validBoundingBox(annotationV1: CDFAnnotationV1) {
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

export function validPolygon(annotationV1: CDFAnnotationV1) {
  return (
    !!annotationV1.region &&
    annotationV1.region.shape === RegionShape.Polygon &&
    annotationV1.region.vertices?.length > 0 &&
    annotationV1.region.vertices.every(
      (item) => 'x' in item && 'y' in item && vertexIsNormalized(item)
    ) &&
    uniqueVertices(annotationV1.region.vertices)
  );
}

export function validImageAssetLink(annotationV1: CDFAnnotationV1) {
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

export function validKeypointCollection(annotationV1: CDFAnnotationV1) {
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
