/*!
 * Copyright 2019 Cognite AS
 */

import { Box3 } from '../utils/Box3';
import { mat4 } from 'gl-matrix';

export type SectorModelTransformation = {
  modelMatrix: mat4;
};

export interface SectorMetadata {
  id: number;
  path: string;
  bounds: Box3;
  children: SectorMetadata[];
}

export type Color = number;

export type TriangleMesh = {
  // offset: number;
  // count: number;
  fileId: number;

  indices: Uint32Array;
  vertices: Float32Array;
  normals: Float32Array | undefined;
  colors: Float32Array;
};

export class Sector {
  readonly triangleMeshes: TriangleMesh[] = [];
}

export interface SectorQuads {
  buffer: Float32Array;
};

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
  indices: Uint32Array,
  vertices: Float32Array,
  normals: Float32Array | undefined,
};

export interface WantedSectors {
  detailed: Set<number>;
  simple: Set<number>;
};
