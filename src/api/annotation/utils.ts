import { AnnotationRegion } from 'src/api/vision/detectionModels/types';
import { LegacyAnnotation, LegacyUnsavedAnnotation } from './legacyTypes';

/**
 * @deprecated method of Annotation V1 api
 */
const enforceValidCoordinate = (coord: number) => {
  if (coord < 0) {
    return 0;
  }
  if (coord > 1) {
    return 1;
  }
  return coord;
};

/**
 * @deprecated method of Annotation V1 api
 *
 * removes duplicate vertices and sets upper and lower limits for vertex positions
 * @param region
 */
export function enforceRegionValidity(region: AnnotationRegion) {
  const validRegion = {
    ...region,
    vertices: region.vertices.map((vertex) => ({
      x: enforceValidCoordinate(vertex.x),
      y: enforceValidCoordinate(vertex.y),
    })),
  };

  const vertexSignatures = validRegion.vertices.map(
    (vertex) => `${vertex.x}-${vertex.y}`
  );

  const validRegionWithoutDuplicates = {
    ...validRegion,
    vertices: validRegion.vertices
      // remove duplicates
      .filter(
        (vertex, i) => vertexSignatures.indexOf(`${vertex.x}-${vertex.y}`) === i
      ),
  };
  return validRegionWithoutDuplicates;
}

/**
 * @deprecated method of Annotation V1 api
 */
export function validateAnnotationV1(
  annotation: LegacyAnnotation | LegacyUnsavedAnnotation
): boolean {
  if (annotation.region) {
    const vertexSignatures = annotation.region.vertices.map(
      (vertex) => `${vertex.x}-${vertex.y}`
    );

    const validVertices = annotation.region.vertices.every((vertex, i) => {
      return (
        vertex.x >= 0 &&
        vertex.x <= 1 &&
        vertex.y >= 0 &&
        vertex.y <= 1 &&
        vertexSignatures.indexOf(`${vertex.x}-${vertex.y}`) === i // should not be duplicate
      );
    });
    if (!validVertices) {
      throw new Error(
        'Annotation coordinates must be between 0 and 1 and cannot be duplicate.'
      );
    }
    return true;
  }
  return false;
}
