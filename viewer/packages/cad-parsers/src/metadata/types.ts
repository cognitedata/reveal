/*!
 * Copyright 2021 Cognite AS
 */

import type { DMSJsonFileItem } from '@reveal/data-providers';
import type { Box3 } from 'three';
import { CadSceneRootMetadata } from './parsers/types';

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

export type CadMetadataWithSignedFiles = {
  readonly signedFiles: { items: DMSJsonFileItem[] };
  readonly fileData: CadSceneRootMetadata;
};
