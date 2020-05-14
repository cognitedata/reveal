/*!
 * Copyright 2020 Cognite AS
 */

import { Box3 } from '@/utilities/Box3';
import { mat4 } from 'gl-matrix';
import { ParsedPrimitives } from '@/utilities/workers/types/parser.types';

// TODO 2019-11-12 larsmoa: Move and rename to something general (not specific
// for sector data).
export type SectorModelTransformation = {
  readonly modelMatrix: mat4;
  readonly inverseModelMatrix: mat4;
};

export interface SectorMetadataIndexFileSection {
  readonly fileName: string;
  readonly peripheralFiles: string[];
  readonly estimatedDrawCallCount: number;
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
  readonly bounds: Box3;
  readonly indexFile: SectorMetadataIndexFileSection;
  readonly facesFile: SectorMetadataFacesFileSection;
  readonly children: SectorMetadata[];

  // TODO 2019-12-21 larsmoa: Make readonly
  parent?: SectorMetadata;
}

export type Color = number;

export type TriangleMesh = {
  readonly fileId: number;
  readonly indices: Uint32Array;
  readonly treeIndices: Float32Array;
  readonly vertices: Float32Array;
  readonly normals: Float32Array | undefined;
  readonly colors: Float32Array;
};

export type InstancedMeshFile = {
  readonly fileId: number;
  readonly indices: Uint32Array;
  readonly vertices: Float32Array;
  readonly normals: Float32Array | undefined;
  readonly instances: InstancedMesh[];
};

export type InstancedMesh = {
  readonly triangleCount: number;
  readonly triangleOffset: number;
  readonly colors: Uint8Array;
  readonly instanceMatrices: Float32Array;
  readonly treeIndices: Float32Array;
};

// TODO 2019-12-05 larsmoa: Rename to e.g. SectorGeometry to avoid
// confusion with other Sector-class
export interface Sector {
  readonly nodeIdToTreeIndexMap: Map<number, number>;
  readonly treeIndexToNodeIdMap: Map<number, number>;

  readonly primitives: ParsedPrimitives;

  readonly instanceMeshes: InstancedMeshFile[];
  readonly triangleMeshes: TriangleMesh[];
}

export interface SectorQuads {
  readonly nodeIdToTreeIndexMap: Map<number, number>;
  readonly treeIndexToNodeIdMap: Map<number, number>;
  readonly buffer: Float32Array;
}

export enum LoadSectorStatus {
  Awaiting,
  InFlight,
  Cancelled,
  Resolved
}

export type LoadSectorRequest = {
  readonly promise: Promise<void>;
  cancel: () => void;
  status: () => LoadSectorStatus;
};

// TODO move somewhere else?
export interface CtmWorkerResult {
  readonly indices: Uint32Array;
  readonly vertices: Float32Array;
  readonly normals: Float32Array | undefined;
}
