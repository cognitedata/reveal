/*!
 * Copyright 2025 Cognite AS
 */
export type ResourceTypes = 'CAD' | 'PointCloud' | 'unknown';

export function getModelType(
  types: Array<
    | 'model-from-points:1'
    | 'tiles-directory:1'
    | 'ept-pointcloud:1'
    | 'ciff-partially-processed:0'
    | 'ciff-processed:0'
    | 'node-property-metadata-json:0'
    | 'reveal-directory:8'
    | 'gltf-directory:9'
  >
): ResourceTypes {
  if (types.includes('gltf-directory:9') || types.includes('reveal-directory:8')) {
    return 'CAD';
  }
  if (types.includes('ept-pointcloud:1')) {
    return 'PointCloud';
  }
  return 'unknown';
}
