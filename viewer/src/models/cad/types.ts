/*!
 * Copyright 2019 Cognite AS
 */

import { Box3 } from '../../utils/Box3';
import { mat4, vec3 } from 'gl-matrix';
import { PrimitiveAttributes } from '../../workers/types/parser.types';
import { CadLoadingStyle } from './CadLoadingStyle';

/**
 * Input to DetermineSectorsDelegate.
 */
export interface DetermineSectorsInput {
  readonly scene: SectorScene;
  readonly cameraFov: number;
  readonly cameraPosition: vec3;
  readonly cameraModelMatrix: mat4;
  readonly projectionMatrix: mat4;
  readonly loadingStyle?: CadLoadingStyle;
}

// TODO 2019-11-12 larsmoa: Move and rename to something general (not specific
// for sector data).
export type SectorModelTransformation = {
  readonly modelMatrix: mat4;
  readonly inverseModelMatrix: mat4;
};

export interface SectorMetadata {
  readonly id: number;
  readonly path: string;
  readonly bounds: Box3;
  readonly simple?: {
    readonly gridSize: vec3;
    readonly gridOrigin: vec3;
    readonly gridIncrement: number;
    readonly nodeCount: number;
  };
  readonly children: SectorMetadata[];
  // TODO 2019-12-21 larsmoa: Make readonly
  parent?: SectorMetadata;
}

export interface SectorScene {
  readonly root: SectorMetadata;
  readonly sectors: Map<number, SectorMetadata>;
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
  readonly instanceMeshes: InstancedMeshFile[];
  readonly triangleMeshes: TriangleMesh[];

  readonly boxes: PrimitiveAttributes;
  readonly circles: PrimitiveAttributes;
  readonly cones: PrimitiveAttributes;
  readonly eccentricCones: PrimitiveAttributes;
  readonly ellipsoidSegments: PrimitiveAttributes;
  readonly generalCylinders: PrimitiveAttributes;
  readonly generalRings: PrimitiveAttributes;
  readonly nuts: PrimitiveAttributes;
  readonly quads: PrimitiveAttributes;
  readonly sphericalSegments: PrimitiveAttributes;
  readonly torusSegments: PrimitiveAttributes;
  readonly trapeziums: PrimitiveAttributes;
}

export interface SectorQuads {
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

export interface WantedSectors {
  readonly detailed: Set<number>;
  readonly simple: Set<number>;
}
