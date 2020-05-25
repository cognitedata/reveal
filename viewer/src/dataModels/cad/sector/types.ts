/*!
 * Copyright 2020 Cognite AS
 */

import { LevelOfDetail } from './LevelOfDetail';

import { mat4 } from 'gl-matrix';

import { Box3 } from '@/utilities/Box3';
import { ParsedPrimitives, ParseSectorResult, ParseCtmResult } from '@/utilities/workers/types/parser.types';
import { InstancedMeshFile, TriangleMesh, SectorQuads } from '../rendering/types';
import { ModelDataRetriever } from '@/utilities/networking/ModelDataRetriever';
import { SectorScene } from './SectorScene';

// TODO 2020-05-14 larsmoa: Move to SectorModelTransformation utilities and rename
export type SectorModelTransformation = {
  readonly modelMatrix: mat4;
  readonly inverseModelMatrix: mat4;
};

export interface ConsumedSector {
  cadModelIdentifier: string;
  metadata: SectorMetadata;
  levelOfDetail: LevelOfDetail;
  group: THREE.Group | undefined;
}

export interface ParsedSector {
  cadModelIdentifier: string;
  metadata: SectorMetadata;
  data: null | ParseSectorResult | ParseCtmResult | SectorGeometry | SectorQuads;
  levelOfDetail: LevelOfDetail;
}

export interface WantedSector {
  cadModelIdentifier: string;
  dataRetriever: ModelDataRetriever;
  scene: SectorScene;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}

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

export interface SectorGeometry {
  readonly nodeIdToTreeIndexMap: Map<number, number>;
  readonly treeIndexToNodeIdMap: Map<number, number>;

  readonly primitives: ParsedPrimitives;

  readonly instanceMeshes: InstancedMeshFile[];
  readonly triangleMeshes: TriangleMesh[];
}
