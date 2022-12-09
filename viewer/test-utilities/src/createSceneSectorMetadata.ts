/*!
 * Copyright 2022 Cognite AS
 */

import { SceneSectorMetadata } from '../../packages/cad-parsers/src/metadata/parsers/types';

export type BoundingBox = {
  min: {
    x: number;
    y: number;
    z: number;
  };
  max: {
    x: number;
    y: number;
    z: number;
  };
};

export function createV9SceneSectorMetadata(
  id: number,
  parentId: number = -1,
  boundingBox?: BoundingBox,
  geometryBoundingBox?: BoundingBox
): SceneSectorMetadata {
  const metadata: SceneSectorMetadata = {
    id,
    parentId,
    path: '0/',
    depth: 0,
    estimatedDrawCallCount: 10,
    estimatedTriangleCount: 10,
    boundingBox: boundingBox ?? {
      min: {
        x: 0.0,
        y: 0.0,
        z: 0.0
      },
      max: {
        x: 1.0,
        y: 1.0,
        z: 1.0
      }
    },
    geometryBoundingBox,
    downloadSize: 1000,
    maxDiagonalLength: 10,
    minDiagonalLength: 5,
    sectorFileName: `${id}.glb`
  };
  return metadata;
}
