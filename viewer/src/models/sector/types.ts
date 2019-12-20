/*!
 * Copyright 2019 Cognite AS
 */

import { Box3 } from '../../utils/Box3';
import { mat4, vec3 } from 'gl-matrix';
import { PrimitiveAttributes } from '../../../workers/types/parser.types';

// TODO 2019-11-12 larsmoa: Move and rename to something general (not specific
// for sector data).
export type SectorModelTransformation = {
  modelMatrix: mat4;
  inverseModelMatrix: mat4;
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
  // TODO can we make this readonly?
  children: SectorMetadata[];
  // TODO can we make this readonly?
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
};

// TODO 2019-12-05 larsmoa: Rename to e.g. SectorGeometry to avoid
// confusion with other Sector-class
export interface Sector {
  instanceMeshes: InstancedMeshFile[];
  triangleMeshes: TriangleMesh[];

  boxes: PrimitiveAttributes;
  circles: PrimitiveAttributes;
  cones: PrimitiveAttributes;
  eccentricCones: PrimitiveAttributes;
  ellipsoidSegments: PrimitiveAttributes;
  generalCylinders: PrimitiveAttributes;
  generalRings: PrimitiveAttributes;
  nuts: PrimitiveAttributes;
  quads: PrimitiveAttributes;
  sphericalSegments: PrimitiveAttributes;
  torusSegments: PrimitiveAttributes;
  trapeziums: PrimitiveAttributes;
}

export interface SectorQuads {
  buffer: Float32Array;
}

export enum LoadSectorStatus {
  Awaiting,
  InFlight,
  Cancelled,
  Resolved
}

export type LoadSectorRequest = {
  promise: Promise<void>;
  cancel: () => void;
  status: () => LoadSectorStatus;
};

// TODO move somewhere else?
export interface CtmWorkerResult {
  indices: Uint32Array;
  vertices: Float32Array;
  normals: Float32Array | undefined;
}

export interface WantedSectors {
  readonly detailed: Set<number>;
  readonly simple: Set<number>;
}
