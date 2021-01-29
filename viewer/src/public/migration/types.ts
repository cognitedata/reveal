/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

import { SectorCuller } from '../../datamodels/cad/sector/culling/SectorCuller';
import { Cognite3DModel } from './Cognite3DModel';
import { CognitePointCloudModel } from './CognitePointCloudModel';

/**
 * @module @cognite/reveal
 */
export type Color = {
  r: number;
  g: number;
  b: number;
};
/**
 * Callback to monitor downloaded requests and progress.
 * Use OnLoadingCallback instead of onProgress/onComplete.
 * @module @cognite/reveal
 */
export type OnLoadingCallback = (itemsDownloaded: number, itemsRequested: number) => void;

/**
 * @module @cognite/reveal
 */
export interface Cognite3DViewerOptions {
  /** Initialized connection to CDF used to load data. */
  sdk: CogniteClient;

  /** An existing DOM element that we will render canvas into. */
  domElement?: HTMLElement;

  /** Send anonymous usage statistics. */
  logMetrics?: boolean;

  /**
   * Render to offscreen buffer instead of canvas.
   * @version new in 1.3.0
   */
  renderTargetOptions?: { target: THREE.WebGLRenderTarget; autoSetSize?: boolean };

  /** @deprecated And ignored. */
  highlightColor?: THREE.Color;

  /** @deprecated And ignored. */
  noBackground?: boolean;

  /** @deprecated And not supported. */
  viewCube?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';

  /** @deprecated And not supported. */
  enableCache?: boolean;

  /** Renderer used to visualize model (optional). */
  renderer?: THREE.WebGLRenderer;

  /**
   * Hints Reveal to use a given anti-aliasing technique.
   *
   * Fast approximate anti-aliasing (FXAA) is a fast technique that will remove some, but not all aliasing effects. See
   * https://en.wikipedia.org/wiki/Fast_approximate_anti-aliasing.
   *
   * Multi-sampling anti-aliasinbg (MSAA) is a technique for taking multiple samples per pixel to avoid aliasing effects.
   * This mode requires WebGL 2. See https://www.khronos.org/opengl/wiki/Multisampling.
   *
   * The combined modes will apply both MSAA and FXAA anti-aliasing and yields the best visual result.
   *
   * When using the MSAA modes combined with FXAA Reveal will fall back to FXAA on WebGL 1. There is no fallback for the
   * "plain" MSAA modes on WebGL 1.
   *
   * Currently the default mode is FXAA, but this is subject to change.
   *
   * @version new in 1.3.0
   */
  antiAliasingHint?:
    | 'disabled'
    | 'fxaa'
    | 'msaa2+fxaa'
    | 'msaa4+fxaa'
    | 'msaa8+fxaa'
    | 'msaa16+fxaa'
    | 'msaa2'
    | 'msaa4'
    | 'msaa8'
    | 'msaa16';

  /** Callback to download stream progress. */
  onLoading?: OnLoadingCallback;

  /**
   * Utility used to determine what parts of the model will be visible on screen and loaded.
   * This is only meant for unit testing.
   * @internal
   */
  _sectorCuller?: SectorCuller;
}

/**
 * @module @cognite/reveal
 */
export interface GeometryFilter {
  boundingBox?: THREE.Box3;
}

/**
 * @module @cognite/reveal
 */
export interface AddModelOptions {
  modelId: number;
  revisionId: number;
  // if you need to access local files, this is where you would specify it
  localPath?: string;
  geometryFilter?: GeometryFilter;
  orthographicCamera?: boolean;
  onComplete?: () => void;
}

export type CadIntersection = {
  /**
   * The intersection type.
   */
  type: 'cad';
  /**
   * The model that was intersected.
   */
  model: Cognite3DModel;
  /**
   * Coordinate of the intersection.
   */
  point: THREE.Vector3;
  /**
   * Tree index of the intersected 3D node.
   */
  treeIndex: number;
  /**
   * Distance from the camera to the intersection.
   */
  distanceToCamera: number;
};

export type PointCloudIntersection = {
  /**
   * The intersection type.
   */
  type: 'pointcloud';
  /**
   * The model that was intersected.
   */
  model: CognitePointCloudModel;
  /**
   * Tree index of the intersected 3D node.
   */
  point: THREE.Vector3;
  /**
   * The index of the point that was intersected.
   */
  pointIndex: number;
  /**
   * Distance from the camera to the intersection.
   */
  distanceToCamera: number;
};

/**
 * Represents the result from {@link Cognite3DViewer.getIntersectionFromPixel}.
 * @module @cognite/reveal
 */
export type Intersection = CadIntersection | PointCloudIntersection;

/**
 * @module @cognite/reveal
 */
export { CameraConfiguration } from '../../utilities';

/**
 * Delegate for pointer events.
 * @module @cognite/reveal
 * @see {@link Cognite3DViewer.on}.
 */
export type PointerEventDelegate = (event: { offsetX: number; offsetY: number }) => void;

/**
 * Delegate for camera update events.
 * @module @cognite/reveal
 * @see {@link Cognite3DViewer.on}.
 */
export type CameraChangeDelegate = (position: THREE.Vector3, target: THREE.Vector3) => void;

/**
 * Delegate for rendering events.
 * @module @cognite/reveal
 * @see {@link Cognite3DViewer.on}.
 */
export type SceneRenderedDelegate = (event: {
  frameNumber: number;
  renderTime: number;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
}) => void;

export * from './NotSupportedInMigrationWrapperError';
export { CogniteModelBase } from './CogniteModelBase';

/**
 * Represents a measurement of how much geometry can be loaded.
 */
export type CadModelBudget = {
  // TODO 2020-11-04 larsmoa: Merge this type with CadModelSectorBudget.

  /**
   * Sectors within this distance from the camera will always be loaded in high details.
   */
  readonly highDetailProximityThreshold: number;

  /**
   * Number of bytes of the geometry that must be downloaded.
   */
  readonly geometryDownloadSizeBytes: number;

  /**
   * Estimated maximum number of WebGL draw calls to download geometry for. Draw calls
   * are very important for the framerate.
   */
  readonly maximumNumberOfDrawCalls: number;
};

/**
 * Options to control how {@link Cognite3DViewer.getIntersectionFromPixel} behaves.
 * @version new in 1.3.0
 */
export interface IntersectionFromPixelOptions {
  /**
   * Threshold (in meters) for how close a point must be an intersection
   * ray for it to be considered an intersection for point clouds. Defaults
   * to 0.05.
   * @version new in 1.3.0
   */
  pointIntersectionThreshold?: number;
}
