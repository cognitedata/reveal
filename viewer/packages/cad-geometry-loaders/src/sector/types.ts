/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { AutoDisposeGroup }from '@reveal/utilities';
import { SectorMetadata } from '@reveal/cad-parsers';

import { SectorQuads } from '@cognite/reveal-parser-worker';

import { LevelOfDetail } from './LevelOfDetail';
import { ParsedPrimitives, ParseSectorResult, ParseCtmResult } from '@cognite/reveal-parser-worker';

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

export interface SectorGeometry {
  readonly nodeIdToTreeIndexMap: Map<number, number>;
  readonly treeIndexToNodeIdMap: Map<number, number>;

  readonly primitives: ParsedPrimitives;

  readonly instanceMeshes: InstancedMeshFile[];
  readonly triangleMeshes: TriangleMesh[];
}
