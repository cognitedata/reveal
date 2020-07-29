/*!
 * Copyright 2020 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

import { SectorCuller } from '@/datamodels/cad/sector/culling/SectorCuller';

export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface Cognite3DViewerOptions {
  sdk: CogniteClient;

  /** An existing DOM element that we will render canvas into. */
  domElement?: HTMLElement;

  /** Send anonymous usage statistics. */
  logMetrics?: boolean;

  /** @deprecated and ignored */
  highlightColor?: THREE.Color;

  /** @deprecated and ignored */
  noBackground?: boolean;

  /** @deprecated and not supported */
  viewCube?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';

  /** @deprecated and not supported */
  enableCache?: boolean;

  /** Renderer used to visualize model (optional). */
  renderer?: THREE.WebGLRenderer;

  /**
   * Utility used to determine what parts of the model will be visible on screen and loaded.
   * This is only meant for unit testing.
   * @internal
   */
  _sectorCuller?: SectorCuller;
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
