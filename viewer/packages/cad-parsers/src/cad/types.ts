/*!
 * Copyright 2021 Cognite AS
 */

import type * as THREE from 'three';

import type { SectorMetadata } from '../metadata/types';
import type { LevelOfDetail } from './LevelOfDetail';
import type { ParsedGeometry } from '@reveal/sector-parser';
import type { ModelIdentifier } from '@reveal/data-providers';

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

export interface ConsumedSector {
  modelIdentifier: ModelIdentifier;
  metadata: SectorMetadata;
  levelOfDetail: LevelOfDetail;
  instancedMeshes: InstancedMeshFile[] | undefined;
  geometryBatchingQueue?: ParsedGeometry[];
  parsedMeshGeometries?: ParsedMeshGeometry[];
}

export interface WantedSector {
  modelIdentifier: ModelIdentifier;
  modelBaseUrl: string | undefined;
  signedFilesBaseUrl: string | undefined;
  geometryClipBox: THREE.Box3 | null;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}

export type ParsedMeshGeometry = ParsedGeometry & {
  wholeSectorBoundingBox: THREE.Box3;
};
