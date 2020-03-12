/*!
 * Copyright 2020 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

// import Color from '@/core/Cognite3DModel';

export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface Cognite3DViewerOptions {
  domElement?: HTMLElement;
  noBackground?: boolean;
  logMetrics?: boolean;
  highlightColor?: THREE.Color;
  // Only if you need to access CDF models
  sdk?: CogniteClient;
  viewCube?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  enableCache: boolean;
}

// export { OnProgressData } from '@/helpers/Progress';
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
