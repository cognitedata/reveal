/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { AutoDisposeGroup } from '@reveal/utilities';

import { SectorMetadata } from '../metadata/types';
import { LevelOfDetail } from './LevelOfDetail';
import { ParsedGeometry } from '@reveal/sector-parser';
import { ModelIdentifier } from '@reveal/data-providers';

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
  group: AutoDisposeGroup | undefined;
  instancedMeshes: InstancedMeshFile[] | undefined;
  geometryBatchingQueue?: ParsedGeometry[];
}

export interface WantedSector {
  modelIdentifier: ModelIdentifier;
  modelBaseUrl: string;
  geometryClipBox: THREE.Box3 | null;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}
