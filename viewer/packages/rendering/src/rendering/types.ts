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
export type EdlOptions = {
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
 * Ambient occlusion quality levels supported by Reveal. See {@link getSsaoParametersForQuality}.
 */
export type SsaoQuality = 'medium' | 'high' | 'veryhigh' | 'disabled';

const ssaoQualityPresets: Record<SsaoQuality, SsaoParameters> = {
  // Half resolution AO with depth-aware upsampling. Cheaper than the full resolution presets,
  // at the cost of some fine detail.
  medium: {
    sampleSize: 16,
    halfResolution: true,
    screenSpaceRadius: 32,
    distanceFalloff: 0.2,
    intensity: 2,
    denoiseSampleSize: 8,
    denoiseRadius: 12,
    denoiseIterations: 2
  },
  high: {
    sampleSize: 16,
    halfResolution: false,
    screenSpaceRadius: 32,
    distanceFalloff: 0.2,
    intensity: 2,
    denoiseSampleSize: 8,
    denoiseRadius: 12,
    denoiseIterations: 2
  },
  veryhigh: {
    sampleSize: 32,
    halfResolution: false,
    screenSpaceRadius: 32,
    distanceFalloff: 0.2,
    intensity: 2,
    denoiseSampleSize: 16,
    denoiseRadius: 8,
    denoiseIterations: 2
  },
  disabled: {
    sampleSize: 0,
    halfResolution: false,
    screenSpaceRadius: 32,
    distanceFalloff: 0.2,
    intensity: 2,
    denoiseSampleSize: 0,
    denoiseRadius: 0,
    denoiseIterations: 0
  }
};

/**
 * Returns the ambient occlusion parameters used for the given quality level.
 */
export function getSsaoParametersForQuality(quality: SsaoQuality): SsaoParameters {
  return { ...ssaoQualityPresets[quality] };
}

/**
 * Defaults for {@ref RevealRenderOptions}.
 */
export const defaultRenderOptions: Required<RenderOptions> = {
  antiAliasing: AntiAliasingMode.FXAA,
  multiSampleCountHint: 1,
  ssaoRenderParameters: getSsaoParametersForQuality('medium'),
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
 * Screen-space ambient occlusion parameters supported by Reveal. Reveal uses an implementation of
 * N8AO (https://github.com/N8python/n8ao): hemisphere sampling around normals reconstructed from depth,
 * followed by depth- and normal-aware denoising.
 */
export type SsaoParameters = {
  /**
   * Number of samples per pixel used to estimate the occlusion factor. 0 disables ambient occlusion.
   */
  sampleSize: number;
  /**
   * Computes ambient occlusion at half resolution (in each dimension), followed by depth-aware upsampling.
   */
  halfResolution: boolean;
  /**
   * Radius of the sampled hemisphere, in pixels for a render height of 1080 pixels (scaled proportionally
   * with the render height). Being defined in screen space, the occlusion radius adapts to the scale of what is
   * viewed, so it works for overviews of large sites, life-size close-ups and scaled-down models alike.
   */
  screenSpaceRadius: number;
  /**
   * Depth difference, relative to the sampling radius, over which occluders fade out. Lower values reduce
   * haloing around objects in front of others, but make the occlusion weaker.
   */
  distanceFalloff: number;
  /**
   * Exponent applied to the ambient occlusion term. Higher values give darker occlusion.
   */
  intensity: number;
  /**
   * Number of samples used per denoise iteration.
   */
  denoiseSampleSize: number;
  /**
   * Radius of the denoise filter in pixels at full resolution.
   */
  denoiseRadius: number;
  /**
   * Number of denoise iterations. 0 disables denoising.
   */
  denoiseIterations: number;
};

/**
 * Point cloud rendering parameters supported by Reveal.
 */
export type PointCloudParameters = {
  /**
   * Effect of blending close points together. Creates smoother texture on object surfaces.
   */
  pointBlending: boolean;
  /**
   * Eye Dome Lighting effect options. Considerably improves perception of depth within rendered point cloud.
   */
  edlOptions: EdlOptions;
};
