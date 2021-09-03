/*!
 * Copyright 2021 Cognite AS
 */

import { HttpHeadersProvider } from './HttpHeadersProvider';

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
}

/*
 * From core/src/utilities/
 */

export enum File3dFormat {
  EptPointCloud = 'ept-pointcloud',
  RevealCadModel = 'reveal-directory',
  AnyFormat = 'all-outputs'
}

export interface BlobOutputMetadata {
  blobId: number;
  format: File3dFormat | string;
  version: number;
}

export interface JsonFileProvider {
  getJsonFile(baseUrl: string, fileName: string): Promise<any>;
}

export interface BinaryFileProvider {
  getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer>;
}

export interface ModelMetadataProvider<TModelIdentifier> {
  getModelUrl(identifier: TModelIdentifier): Promise<string>;
  getModelCamera(identifier: TModelIdentifier): Promise<CameraConfiguration | undefined>;
  getModelMatrix(identifier: TModelIdentifier): Promise<THREE.Matrix4>;
}

export interface ModelDataClient<TModelIdentifier>
  extends HttpHeadersProvider,
    ModelMetadataProvider<TModelIdentifier>,
    JsonFileProvider,
    BinaryFileProvider {
  getJsonFile(baseUrl: string, fileName: string): Promise<any>;
  getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer>;

  /**
   * Returns an identifier that can be used to identify the application Reveal is used in.
   */
  getApplicationIdentifier(): string;
}

/**
 * Represents a camera configuration, consisting of a camera position and target.
 */
export type CameraConfiguration = {
  readonly position: THREE.Vector3;
  readonly target: THREE.Vector3;
};
