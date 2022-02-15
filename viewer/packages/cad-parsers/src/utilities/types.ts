/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { SectorMetadata } from '../metadata/types';

/**
 * Conversion factors from a given unit to meters.
 */
const WellKnownDistanceToMeterConversionFactors = new Map<string, number>([
  ['meters', 1.0],
  ['meter', 1.0],
  ['m', 1.0],
  ['centimeters', 0.01],
  ['centimeter', 0.01],
  ['cm', 0.01],
  ['millimeters', 0.001],
  ['millimeter', 0.001],
  ['mm', 0.001],
  ['micrometers', 1e-6],
  ['micrometer', 1e-6],
  ['kilometers', 1000],
  ['kilometer', 1000],
  ['km', 1000],
  ['feet', 0.3048],
  ['ft', 0.3048],
  ['inches', 0.0254],
  ['inch', 0.0254],
  ['yards', 0.9144],
  ['yard', 0.9144],
  ['miles', 1609.34],
  ['miles', 1609.34],
  ['mile', 1609.34],
  ['mils', 0.0254 * 1e-3],
  ['mil', 0.0254 * 1e-3],
  ['microinches', 0.0254 * 1e-6],
  ['microinch', 0.0254 * 1e-6]
]);

export function getDistanceToMeterConversionFactor(unit: string | undefined): number | undefined {
  unit = unit ?? 'meters';
  return WellKnownDistanceToMeterConversionFactors.get(unit.toLowerCase());
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
