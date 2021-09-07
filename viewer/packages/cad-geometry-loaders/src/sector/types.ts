/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import * as THREEext from '../utilities/three';

import { LevelOfDetail } from './LevelOfDetail';
import { InstancedMeshFile, TriangleMesh, SectorQuads } from '../rendering/types';
import { ParsedPrimitives, ParseSectorResult, ParseCtmResult } from '@cognite/reveal-parser-worker';
import { SectorMetadata } from '@reveal/cad-parsers';

export interface ConsumedSector {
  modelIdentifier: string;
  metadata: SectorMetadata;
  levelOfDetail: LevelOfDetail;
  group: THREEext.AutoDisposeGroup | undefined;
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
