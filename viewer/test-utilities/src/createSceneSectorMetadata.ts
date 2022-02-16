/*!
 * Copyright 2022 Cognite AS
 */

import { V9SceneSectorMetadata, V8SceneSectorMetadata } from '../../packages/cad-parsers/src/metadata/parsers/types';

export function createV9SceneSectorMetadata(id: number, parentId: number = -1): V9SceneSectorMetadata {
  const metadata: V9SceneSectorMetadata = {
    id,
    parentId,
    path: '0/',
    depth: 0,
    estimatedDrawCallCount: 10,
    estimatedTriangleCount: 10,
    boundingBox: {
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
    downloadSize: 1000,
    maxDiagonalLength: 10,
    minDiagonalLength: 5,
    sectorFileName: `${id}.glb`
  };
  return metadata;
}

export function createV8SceneSectorMetadata(id: number, parentId: number = -1): V8SceneSectorMetadata {
  const metadata: V8SceneSectorMetadata = {
    id,
    parentId,
    path: '0/',
    depth: 0,
    estimatedDrawCallCount: 10,
    estimatedTriangleCount: 10,
    boundingBox: {
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
    indexFile: {
      fileName: `sector_${id}.i3d`,
      peripheralFiles: [],
      downloadSize: 19996
    },
    facesFile: {
      fileName: `sector_${id}.f3d`,
      quadSize: 0.5,
      coverageFactors: {
        xy: 0.5,
        xz: 0.5,
        yz: 0.5
      },
      recursiveCoverageFactors: {
        xy: 0.6,
        xz: 0.7,
        yz: 0.8
      },
      downloadSize: 1000
    }
  };
  return metadata;
}
