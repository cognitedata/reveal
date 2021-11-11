/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

import { SectorCuller } from '@reveal/cad-geometry-loaders';
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
 * Units supported by {@link Cognite3DModel}.
 */
export type WellKnownUnit =
  | 'Meters'
  | 'Centimeters'
  | 'Millimeters'
  | 'Micrometers'
  | 'Kilometers'
  | 'Feet'
  | 'Inches'
  | 'Yards'
  | 'Miles'
  | 'Mils'
  | 'Microinches';

/**
 * Callback to monitor loaded requests and progress.
 * Use OnLoadingCallback instead of onProgress/onComplete.
 * @module @cognite/reveal
 *
 * @param itemsLoaded Number of items loaded so far in this batch.
 * @param itemsRequested Total number of items to load in this batch.
 * @param itemsCulled Number of items deemed unnecessary to load in this batch.
 */
export type OnLoadingCallback = (itemsLoaded: number, itemsRequested: number, itemsCulled: number) => void;

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
   */
  renderTargetOptions?: { target: THREE.WebGLRenderTarget; autoSetSize?: boolean };

  /**
   * Style the loading indicator.
   */
  loadingIndicatorStyle?: {
    /**
     * What corner the spinner should be placed in. Defaults top topLeft.
     */
    placement: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
    /**
     * Opacity of the spinner in fractions. Defaults to 1.0.
     */
    opacity: number;
  };

  /**
   * When false, camera near and far planes will not be updated automatically (defaults to true).
   * This can be useful when you have custom content in the 3D view and need to better
   * control the view frustum.
   *
   * When automatic camera near/far planes are disabled, you are responsible for setting
   * this on your own.
   * @example
   * ```
   * viewer.camera.near = 0.1;
   * viewer.camera.far = 1000.0;
   * viewer.camera.updateProjectionMatrix();
   * ```
   */
  automaticCameraNearFar?: boolean;

  /**
   * When false, the sensitivity of the camera controls will not be updated automatically.
   * This can be useful to better control the sensitivity of the 3D navigation.
   *
   * When not set, control the sensitivity of the camera using `viewer.cameraControls.minDistance`
   * and `viewer.cameraControls.maxDistance`.
   */
  automaticControlsSensitivity?: boolean;

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

  /**
   * Hints the renderer of the quality it should aim for for screen space ambient occlusion,
   * an effect creating shadows and that gives the rendered image more depth.
   */
  ssaoQualityHint?: 'medium' | 'high' | 'veryhigh' | 'disabled';

  /**
   * Enables / disables visualizing the edges of geometry. Defaults to true.
   */
  enableEdges?: boolean;

  /** Callback to download stream progress. */
  onLoading?: OnLoadingCallback;

  /**
   * Allows providing a custom data source that Reveal will
   * use to load model data. Note that some features might not
   * work when implementing a custom data source. Please refer
   * to the Reveal documentation for details.
   *
   * Note that the data source must support {@link CdfModelIdentifier}.
   *
   * This cannot be used together with {@link _localModels}.
   */
  customDataSource?: DataSource;

  /**
   * Utility used to determine what parts of the model will be visible on screen and loaded.
   * This is only meant for unit testing.
   * @internal
   */
  _sectorCuller?: SectorCuller;

  /**
   * When true, the viewer will load models stored locally and ignore
   * the provided CogniteClient. This is only meant for development.
   * Note! Marked as internal so when using this in debugging you must
   * use e.g. @ts-expect-error to ignore type checks.
   * @internal
   */
  _localModels?: boolean;
}

import { GeometryFilter } from '../../public/types';
import { DataSource } from '@reveal/data-source';
export { GeometryFilter };

/**
 * @module @cognite/reveal
 */
export interface AddModelOptions {
  modelId: number;
  revisionId: number;
  // if you need to access local files, this is where you would specify it.
  localPath?: string;
  geometryFilter?: GeometryFilter;
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
export { CameraConfiguration } from '@reveal/utilities';

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
 * Delegate for disposal events.
 */
export type DisposedDelegate = () => void;

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

  /**
   * Maximum render cost. This number can be thought of as triangle count, although the number
   * doesn't match this directly.
   */
  readonly maximumRenderCost: number;
};

/**
 * Represents a budget of how many point from point clouds can be
 * loaded at the same time.
 */
export type PointCloudBudget = {
  /**
   * Total number of points that can be loaded for all point clouds models
   * accumulated.
   */
  readonly numberOfPoints: number;
};

/**
 * Options to control how {@link Cognite3DViewer.getIntersectionFromPixel} behaves.
 */
export interface IntersectionFromPixelOptions {
  /**
   * Threshold (in meters) for how close a point must be an intersection
   * ray for it to be considered an intersection for point clouds. Defaults
   * to 0.05.
   */
  pointIntersectionThreshold?: number;
}
