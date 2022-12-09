/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

export type BaseSectorMetadata = {
  readonly id: number;
  readonly path: string;
  readonly depth: number;
  readonly subtreeBoundingBox: THREE.Box3;
  readonly children: SectorMetadata[];
  readonly estimatedDrawCallCount: number;
  readonly estimatedRenderCost: number;
};

export type SectorMetadata = BaseSectorMetadata & GltfSectorMetadata;

export type GltfSectorMetadata = {
  readonly sectorFileName: string | null;
  readonly maxDiagonalLength: number;
  readonly minDiagonalLength: number;
  readonly downloadSize: number;
  readonly geometryBoundingBox: THREE.Box3;
};
