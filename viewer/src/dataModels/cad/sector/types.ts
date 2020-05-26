/*!
 * Copyright 2020 Cognite AS
 */

import { LevelOfDetail } from './LevelOfDetail';

import { mat4, vec3 } from 'gl-matrix';

import { Box3 } from '@/utilities/Box3';
import { ParsedPrimitives, ParseSectorResult, ParseCtmResult } from '@/utilities/workers/types/parser.types';
import { InstancedMeshFile, TriangleMesh, SectorQuads } from '../rendering/types';

// TODO 2020-05-14 larsmoa: Move to SectorModelTransformation utilities and rename
export type SectorModelTransformation = {
  readonly modelMatrix: mat4;
  readonly inverseModelMatrix: mat4;
};

export interface ConsumedSector {
  blobUrl: string;
  metadata: SectorMetadata;
  levelOfDetail: LevelOfDetail;
  group: THREE.Group | undefined;
}

export interface ParsedSector {
  blobUrl: string;
  metadata: SectorMetadata;
  data: null | ParseSectorResult | ParseCtmResult | SectorGeometry | SectorQuads;
  levelOfDetail: LevelOfDetail;
}

export interface WantedSector {
  blobUrl: string;
  // TODO 2020-05-05 larsmoa: Remove SectorModelTransformation in WantedSector
  cadModelTransformation: SectorModelTransformation;
  scene: SectorScene;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}

export interface SectorScene {
  readonly version: number;
  readonly maxTreeIndex: number;
  readonly root: SectorMetadata;

  readonly sectorCount: number;
  getSectorById(sectorId: number): SectorMetadata | undefined;
  getSectorsContainingPoint(p: vec3): SectorMetadata[];
  getSectorsIntersectingBox(b: Box3): SectorMetadata[];

  /**
   * Gets the sectors intersecting the frustum provided from the projection and inverse
   * camera matrix. Note that this function expects matrices in the the coordinate system
   * of the metadata. See below how to convert ThreeJS camera matrices to the correct format.
   *
   * @example Converting a ThreeJS camera to a frustum
   * const cameraMatrixWorldInverse = fromThreeMatrix(mat4.create(), camera.matrixWorldInverse);
   * const cameraProjectionMatrix = fromThreeMatrix(mat4.create(), camera.projectionMatrix);
   *
   * const transformedCameraMatrixWorldInverse =
   *   mat4.multiply(
   *     transformedCameraMatrixWorldInverse,
   *     cameraMatrixWorldInverse,
   *     model.modelTransformation.modelMatrix
   *   );
   *
   * const intersectingSectors = model.scene.getSectorsIntersectingFrustum(
   *   cameraProjectionMatrix,
   *   transformedCameraMatrixWorldInverse
   * );
   *
   * @param projectionMatrix
   * @param inverseCameraModelMatrix
   */
  getSectorsIntersectingFrustum(projectionMatrix: mat4, inverseCameraModelMatrix: mat4): SectorMetadata[];
  getAllSectors(): SectorMetadata[];

  // Available, but not supported:
  // readonly projectId: number;
  // readonly modelId: number;
  // readonly revisionId: number;
  // readonly subRevisionId: number;
  // readonly unit: string | null;
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
