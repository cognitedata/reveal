/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

import { CadModelBudget, SectorCuller } from '@reveal/cad-geometry-loaders';
import { PointCloudBudget, PointCloudIntersection } from '@reveal/pointclouds';
import { CameraManager } from '@reveal/camera-manager';

import { GeometryFilter, Cognite3DModel } from '@reveal/cad-model';
import { DataSource } from '@reveal/data-source';

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
     * Opacity of the spinner in fractions. Valid values are between
     * 0.2 and 1.0. Defaults to 1.0.
     */
    opacity: number;
  };
  /**
   * Camera manager instance that is used for controlling the camera.
   * It is responsible for all manipulations that are done with the camera,
   * including animations and modification of state. Also, gives ability
   * to provide custom `THREE.PerspectiveCamera` instance to {@link Cognite3DViewer}.
   * Default implementation is {@link DefaultCameraManager}.
   */
  cameraManager?: CameraManager;
  /**
   * Renderer used to visualize model (optional).
   * Note that when providing a custom renderer, this should be configured with
   * `'powerPreference': 'high-performance'` for best performance.
   */
  renderer?: THREE.WebGLRenderer;

  /**
   * Generally Reveal will follow the resolution given by the size
   * of the encapsulating DOM element of the Canvas {@link Cognite3DViewerOptions.domElement}.
   * To ensure managable performance, Reveal will by default set an upper threshold to limit
   * the resolution. Setting the {@link Cognite3DViewerOptions.rendererResolutionThreshold} will
   * set this upper limit of what resolution Reveal will allow.
   */
  rendererResolutionThreshold?: number;

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
   * Point cloud visualisation effects parameteres.
   */
  pointCloudEffects?: {
    /**
     * Point blending effect, creates more "stable" texture on objects surfaces if point sizing is
     * big enough. Can cause significant decrease in performance on some machines.
     */
    pointBlending?: boolean;
  };

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
   * Allows for controlling if geometry streaming should be halted when
   * the camera is moving. Note that this option should left to false on
   * low-end devices as more loading can cause frame drops.
   *
   * Default value is set to false.
   */
  continuousModelStreaming?: boolean;

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

export type AddImage360Options = {
  /**
   * An optional transformation which will be applied to all 360 images that are fetched.
   */
  collectionTransform?: THREE.Matrix4;
  /**
   * Set this to false if the 360 images' rotation is not pre-multiplied to fit the given model.
   * @default true
   */
  preMultipliedRotation?: boolean;
};

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

/**
 * Represents the result from {@link Cognite3DViewer.getIntersectionFromPixel}.
 * @module @cognite/reveal
 */
export type Intersection = CadIntersection | PointCloudIntersection;

/**
 * @module @cognite/reveal
 */
export { CameraConfiguration } from '@reveal/utilities';

export { CadModelBudget, PointCloudBudget };
