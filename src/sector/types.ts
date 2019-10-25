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
  offset: number;
  count: number;

  color: Color;
  fileId: number;
  indices: Uint32Array;
  vertices: Float32Array;
  normals: Float32Array | undefined;
};

export class Sector {
  readonly triangleMeshes: TriangleMesh[] = [];
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
