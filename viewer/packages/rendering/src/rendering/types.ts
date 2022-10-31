/*!
 * Copyright 2021 Cognite AS
 */

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
 * Configuration parameters for Eye Dome Lighting (EDL) point cloud post-processing effect.
 */
export type EDLOptions = {
  /**
   * Determines how pronounced the effect is. Lower values result in more transparent edges.
   */
  strength: number;
  /**
   * Radius of sampled points in pixels. Determines thickness of edges addet on top of points.
   */
  radius: number;
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
  /**
   * Point cloud effects parameters.
   */
  pointCloudParameters?: PointCloudParameters;
};

/**
 * SSAO rendering quality modes supported by Reveal.
 */
export enum SsaoSampleQuality {
  Medium = 32,
  High = 64,
  VeryHigh = 128,
  None = 0,
  Default = Medium
}

/**
 * Defaults for {@ref RevealRenderOptions}.
 */
export const defaultRenderOptions: Required<RenderOptions> = {
  antiAliasing: AntiAliasingMode.FXAA,
  multiSampleCountHint: 1,
  ssaoRenderParameters: { sampleSize: SsaoSampleQuality.Default, sampleRadius: 1.0, depthCheckBias: 0.0125 },
  edgeDetectionParameters: { enabled: true },
  pointCloudParameters: { pointBlending: false, edlOptions: { strength: 0.5, radius: 2.2 } }
};

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
   * Quality (Number of samples) tond estimate occlusion factor.
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
 * Point cloud rendering parameters supported by Reveal.
 */
export type PointCloudParameters = {
  /**
   * Effect of blending close points together. Creates smoother texture on object surfaces.
   */
  pointBlending?: boolean;
  /**
   * Eye Dome Lighting effect options. Considerably improves perception of depth within rendered point cloud.
   */
  edlOptions?: EDLOptions;
};
