/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import * as THREEext from '../../../utilities/three';

import { LevelOfDetail } from './LevelOfDetail';
import { InstancedMeshFile, TriangleMesh, SectorQuads } from '../rendering/types';
import { ParsedPrimitives, ParseSectorResult, ParseCtmResult } from '@cognite/reveal-parser-worker';

/**
 * Conversion factors from a given unit to meters.
 */
export const WellKnownDistanceToMeterConversionFactors = new Map<string, number>([
  ['Meters', 1.0],
  ['Centimeters', 0.01],
  ['Millimeters', 0.001],
  ['Micrometers', 1e-6],
  ['Kilometers', 1000],
  ['Feet', 0.3048],
  ['Inches', 0.0254],
  ['Yards', 0.9144],
  ['Miles', 1609.34],
  ['Mils', 0.0254 * 1e-3],
  ['Microinches', 0.0254 * 1e-6]
]);

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

export interface SectorScene {
  readonly version: number;
  readonly maxTreeIndex: number;
  readonly root: SectorMetadata;
  readonly unit: string;

  readonly sectorCount: number;
  getSectorById(sectorId: number): SectorMetadata | undefined;
  getSectorsContainingPoint(p: THREE.Vector3): SectorMetadata[];
  getSectorsIntersectingBox(b: THREE.Box3): SectorMetadata[];

  /**
   * Returns bounds that contains "most geometry". This bounds is an
   * attempt to remove junk geometry from the bounds to allow e.g. setting
   * a good camera position.
   */
  getBoundsOfMostGeometry(): THREE.Box3;

  /**
   * Gets the sectors intersecting the frustum provided from the projection and inverse
   * camera matrix. Note that this function expects matrices in the the coordinate system
   * of the metadata. See below how to convert ThreeJS camera matrices to the correct format.
   *
   * @example Converting a ThreeJS camera to a frustum
   * ```
   * const cameraMatrixWorldInverse = camera.matrixWorldInverse;
   * const cameraProjectionMatrix = camera.projectionMatrix;
   *
   * const transformedCameraMatrixWorldInverse =
   *  new THREE.Matrix4().multiplyMatrices(cameraMatrixWorldInverse, model.modelMatrix)
   *
   * const intersectingSectors = model.scene.getSectorsIntersectingFrustum(
   *   cameraProjectionMatrix,
   *   transformedCameraMatrixWorldInverse
   * );
   * ```
   * @param projectionMatrix
   * @param inverseCameraModelMatrix
   */
  getSectorsIntersectingFrustum(
    projectionMatrix: THREE.Matrix4,
    inverseCameraModelMatrix: THREE.Matrix4
  ): SectorMetadata[];
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
  readonly bounds: THREE.Box3;
  readonly indexFile: SectorMetadataIndexFileSection;
  readonly facesFile: SectorMetadataFacesFileSection;
  readonly children: SectorMetadata[];
  readonly estimatedDrawCallCount: number;
  readonly estimatedRenderCost: number;
}

export interface SectorGeometry {
  readonly nodeIdToTreeIndexMap: Map<number, number>;
  readonly treeIndexToNodeIdMap: Map<number, number>;

  readonly primitives: ParsedPrimitives;

  readonly instanceMeshes: InstancedMeshFile[];
  readonly triangleMeshes: TriangleMesh[];
}
