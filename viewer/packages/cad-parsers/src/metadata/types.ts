/*!
 * Copyright 2021 Cognite AS
 */

import { DMSJsonFileItem } from '@reveal/data-providers/src/types';
import * as THREE from 'three';
import { CadSceneRootMetadata } from './parsers/types';

export type SectorMetadata = {
  readonly id: number;
  readonly path: string;
  readonly depth: number;
  readonly subtreeBoundingBox: THREE.Box3;
  readonly children: SectorMetadata[];
  readonly estimatedDrawCallCount: number;
  readonly estimatedRenderCost: number;

  readonly sectorFileName: string | null;
  readonly maxDiagonalLength: number;
  readonly minDiagonalLength: number;
  readonly downloadSize: number;
  readonly geometryBoundingBox: THREE.Box3;
  readonly signedUrl?: string;
};

export type CadMetadataWithSignedFiles = {
  /**
   * Type of the file data.
   */
  type: 'cadMetadata';
  /**
   * Signed files metadata.
   */
  readonly signedFiles: { items: DMSJsonFileItem[] };
  /**
   * CAD metadata.
   */
  readonly fileData: CadSceneRootMetadata;
};
