/*!
 * Copyright 2020 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

import { SectorCuller } from '@/dataModels/cad/internal/sector/culling/SectorCuller';

// import Color from '@/core/Cognite3DModel';

export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface Cognite3DViewerOptions {
  sdk: CogniteClient;
  domElement?: HTMLElement;
  noBackground?: boolean;
  logMetrics?: boolean;
  highlightColor?: THREE.Color;
  viewCube?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  enableCache?: boolean;
  /**
   * Renderer used to visualize model (optional).
   */
  renderer?: THREE.WebGLRenderer;

  /**
   * Utility used to determine what parts of the model
   * will be visible on screen and loaded. This is only meant for
   * unit testing, and might change in the future.
   * Do not use.
   */
  _sectorCuller?: SectorCuller;
}

export interface OnProgressData {
  step: number;
  numSteps: number;
  title: string;
  progress: number;
  max: number;
}
export interface GeometryFilter {
  boundingBox?: THREE.Box3;
}

export interface AddModelOptions {
  modelId: number;
  revisionId: number;
  // if you need to access local files, this is where you would specify it
  localPath?: string;
  geometryFilter?: GeometryFilter;
  orthographicCamera?: boolean;
  onProgress?: (progress: OnProgressData) => void;
  onComplete?: () => void;
}

export enum SupportedModelTypes {
  PointCloud = 'pointcloud',
  CAD = 'cad',
  /**
   * Not a model supported by Reveal.
   */
  NotSupported = ''
}
