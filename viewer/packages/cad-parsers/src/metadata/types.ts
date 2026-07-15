/*!
 * Copyright 2021 Cognite AS
 */

import type { Box3 } from 'three';

export type SectorMetadata = {
  readonly id: number;
  readonly path: string;
  readonly depth: number;
  readonly subtreeBoundingBox: Box3;
  readonly children: SectorMetadata[];
  readonly estimatedDrawCallCount: number;
  readonly estimatedRenderCost: number;

  readonly sectorFileName: string | null;
  readonly maxDiagonalLength: number;
  readonly minDiagonalLength: number;
  readonly downloadSize: number;
  readonly geometryBoundingBox: Box3;
  readonly signedUrl?: string;
};
