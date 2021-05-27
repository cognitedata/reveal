/*!
 * Copyright 2021 Cognite AS
 */

import { NodeAppearanceProvider } from '../datamodels/cad';
import { SectorGeometry } from '../datamodels/cad/sector/types';
import { SectorQuads } from '../datamodels/cad/rendering/types';
import { SectorCuller } from '../internals';
import { LoadingState } from '../utilities';

/**
 * Anti-aliasing modes supported by Reveal.
 */
export enum AntiAliasingMode {
  /**
   * No anti-aliasing (0).
   */
  NoAA = 0,
  /**
   * Fast-approximate anti-aliasing (FXAA) (1).
   */
  FXAA = 1
}

/**
 * SSAO rendering quality modes supported by Reveal.
 */
export enum SsaoSampleQuality {
  Medium = 32,
  High = 64,
  VeryHigh = 128,
  None = 1,
  Default = Medium
}

/**
 * Edge detection parameters supported by Reveal.
 */
export type EdgeDetectionParameters = {
  enabled: boolean;
};

/**
 * Screen-space ambient occlusion parameters supported by Reveal.
 */
export type SsaoParameters = {
  /**
   * Quality (Number of samples) to estimate occlusion factor.
   */
  sampleSize: SsaoSampleQuality;
  /**
   * Maximum length of sample vector.
   */
  sampleRadius: number;
  /**
   * Applied bias when depth testing to reduce output noise.
   */
  depthCheckBias: number;
};

/**
 * Options and hints for how the Reveal viewer applies rendering effects.
 */
export type RenderOptions = {
  /**
   * Anti-aliasing mode used to avoid aliasing effects in the rendered view.
   */
  antiAliasing?: AntiAliasingMode;
  /**
   * When provided, Reveal will use multi-sampling to reduce aliasing effects when WebGL 2 is
   * available. Ignored if using WebGL 1.
   */
  multiSampleCountHint?: number;
  /**
   * Determines the parameters used for ambient occlusion heuristic shading.
   */
  ssaoRenderParameters?: SsaoParameters;
  /**
   * Determines the parameters used for visualizing edges of the geometry.
   */
  edgeDetectionParameters?: EdgeDetectionParameters;
};

/**
 * Defaults for {@ref RevealRenderOptions}.
 */
export const defaultRenderOptions: Required<RenderOptions> = {
  antiAliasing: AntiAliasingMode.FXAA,
  multiSampleCountHint: 1,
  ssaoRenderParameters: { sampleSize: SsaoSampleQuality.Default, sampleRadius: 1.0, depthCheckBias: 0.0125 },
  edgeDetectionParameters: { enabled: true }
};

/**
 * @property logMetrics Might be used to disable usage statistics.
 * @property nodeAppearanceProvider Style node by tree-index.
 * @property internal Internals are for internal usage only (like unit-testing).
 */
export type RevealOptions = {
  logMetrics?: boolean;
  nodeAppearanceProvider?: NodeAppearanceProvider;
  renderOptions?: RenderOptions;
  internal?: {
    parseCallback?: (parsed: { lod: string; data: SectorGeometry | SectorQuads }) => void;
    sectorCuller?: SectorCuller;
  };
};

export interface GeometryFilter {
  /**
   * The bounds to load geometry within. By default this box is in CDF coordinate space which
   * will be transformed into coordinates relative to the model using the the model transformation
   * which can be specified using {@link https://docs.cognite.com/api/v1/#operation/update3DRevisions |the CDF API},
   * or set in {@link https://fusion.cognite.com/ |Cognite Fusion}.
   * @see {@link isBoundingBoxInModelCoordinates}.
   */
  boundingBox?: THREE.Box3;

  /**
   * When set, the geometry filter {@link boundingBox} will be considered to be in "Reveal/ThreeJS space".
   * Rather than CDF space which is the default. When using Reveal space, the model transformation
   * which can be specified using {@link https://docs.cognite.com/api/v1/#operation/update3DRevisions |the CDF API},
   * or set in {@link https://fusion.cognite.com/ |Cognite Fusion}.
   * @version New in 1.5.0
   */
  isBoundingBoxInModelCoordinates?: boolean;
}

/**
 * Handler for events about data being loaded.
 */
export type LoadingStateChangeListener = (loadingState: LoadingState) => any;

export * from '../datamodels/pointcloud/types';
export * from './migration/types';

export { CadLoadingHints } from '../datamodels/cad/CadLoadingHints';

export { SupportedModelTypes } from '../datamodels/base';
export { CadModelMetadata } from '../datamodels/cad/CadModelMetadata';
export { NodeAppearanceProvider } from '../datamodels/cad/NodeAppearance';
