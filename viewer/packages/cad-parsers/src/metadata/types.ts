/*!
 * Copyright 2021 Cognite AS
 */


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

export interface SectorMetadata {
  readonly id: number;
  readonly path: string;
  readonly depth: number;
  readonly bounds: THREE.Box3;
  readonly indexFile: SectorMetadataIndexFileSection;
  readonly facesFile: SectorMetadataFacesFileSection;
  readonly children: SectorMetadata[];
  readonly estimatedDrawCallCount: number;
}
