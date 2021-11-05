/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { AutoDisposeGroup } from '@reveal/utilities';

import { ParsedPrimitives, ParseSectorResult, ParseCtmResult, SectorQuads } from '@cognite/reveal-parser-worker';

import { SectorMetadata } from '../metadata/types';
import { LevelOfDetail } from './LevelOfDetail';

export type TriangleMesh = {
  readonly fileId: number;
  readonly indices: Uint32Array;
  readonly treeIndices: Float32Array;
  readonly vertices: Float32Array;
  readonly normals: Float32Array | undefined;
  readonly colors: Uint8Array;
};

export type InstancedMeshFile = {
  readonly fileId: number;
  readonly indices: Uint32Array;
  readonly vertices: Float32Array;
  readonly instances: InstancedMesh[];
};

export type InstancedMesh = {
  readonly triangleCount: number;
  readonly triangleOffset: number;
  readonly colors: Uint8Array;
  readonly instanceMatrices: Float32Array;
  readonly treeIndices: Float32Array;
};

export interface SectorGeometry {
  readonly primitives: ParsedPrimitives;

  readonly instanceMeshes: InstancedMeshFile[];
  readonly triangleMeshes: TriangleMesh[];
}

export interface ConsumedSector {
  modelIdentifier: string;
  metadata: SectorMetadata;
  levelOfDetail: LevelOfDetail;
  group: AutoDisposeGroup | undefined;
  instancedMeshes: InstancedMeshFile[] | undefined;
}

export interface ParsedSector {
  modelIdentifier: string;
  metadata: SectorMetadata;
  data: null | ParseSectorResult | ParseCtmResult | SectorGeometry | SectorQuads;
  levelOfDetail: LevelOfDetail;
}

export interface WantedSector {
  modelIdentifier: string;
  modelBaseUrl: string;
  geometryClipBox: THREE.Box3 | null;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}
