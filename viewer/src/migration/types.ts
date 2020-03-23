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

/**
 * Subset of THREE.WebGLRenderer used to support injecting THREE.WeblGLRenderer for testing.
 */
export type Cognite3DThreeRenderer = Pick<
  THREE.WebGLRenderer,
  'domElement' | 'dispose' | 'setSize' | 'getSize' | 'render'
>;
// {
//   readonly domElement: HTMLCanvasElement;
//   dispose(): void;
//   setSize(size: THREE.Vector2): void;
//   getSize(out: THREE.Vector2): THREE.Vector2;
//   render(scene: THREE.Scene, camera: THREE.Camera): void;
// }

export interface Cognite3DViewerOptions {
  sdk: CogniteClient;
  domElement?: HTMLElement;
  noBackground?: boolean;
  logMetrics?: boolean;
  highlightColor?: THREE.Color;
  viewCube?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  enableCache?: boolean;

  renderer?: Cognite3DThreeRenderer;
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
  modelId?: number;
  revisionId?: number;
  // if you need to access local files, this is where you would specify it
  localPath?: string;
  geometryFilter?: GeometryFilter;
  orthographicCamera?: boolean;
  onProgress?: (progress: OnProgressData) => void;
  onComplete?: () => void;
}
