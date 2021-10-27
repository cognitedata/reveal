/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

export interface SectorMetadataIndexFileSection {
  readonly fileName: string;
  readonly peripheralFiles: string[];
  readonly downloadSize: number;
}

export interface SectorMetadataFacesFileSection {
  readonly quadSize: number;
  /**
   * Coverage factors for the sector without children.
   */
  readonly coverageFactors: {
    xy: number;
    yz: number;
    xz: number;
  };
  /**
   * Coverage factor for the sectors including children.
   */
  readonly recursiveCoverageFactors: {
    xy: number;
    yz: number;
    xz: number;
  };
  readonly fileName: string | null;
  readonly downloadSize: number;
}

export type BaseSectorMetadata = {
  readonly id: number;
  readonly path: string;
  readonly depth: number;
  readonly bounds: THREE.Box3;
  readonly children: SectorMetadata[];
  readonly estimatedDrawCallCount: number;
  readonly estimatedRenderCost: number;
};

export type SectorMetadata = BaseSectorMetadata & (V8SectorMetadata | GltfSectorMetadata);

export type V8SectorMetadata = {
  readonly indexFile: SectorMetadataIndexFileSection;
  readonly facesFile: SectorMetadataFacesFileSection;
};

export type GltfSectorMetadata = {
  readonly sectorFileName: string | null;
  readonly maxDiagonalLength: number;
  readonly downloadSize: number;
};
