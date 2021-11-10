/*!
 * Copyright 2021 Cognite AS
 */

import { isMobileOrTablet } from '@reveal/utilities';

/**
 * Represents a measurement of how much geometry can be loaded.
 */
export type CadModelSectorBudget = {
  /**
   * Sectors within this distance from the camera will always be loaded in high details.
   */
  readonly highDetailProximityThreshold: number;

  /**
   * Number of bytes of the geometry that must be downloaded.
   */
  readonly geometryDownloadSizeBytes: number;

  /**
   * Maximum number of estimated draw calls of geometry to load.
   */
  readonly maximumNumberOfDrawCalls: number;

  /**
   * Maximum render cost. This number can be thought of as triangle count, although the number
   * doesn't match this directly.
   */
  readonly maximumRenderCost: number;
};

export const defaultCadModelSectorBudget: CadModelSectorBudget = isMobileOrTablet()
  ? // Mobile/tablet
    {
      highDetailProximityThreshold: 5,
      geometryDownloadSizeBytes: 20 * 1024 * 1024,
      maximumNumberOfDrawCalls: 700,
      maximumRenderCost: 10_000_000
    }
  : // Desktop
    {
      highDetailProximityThreshold: 10,
      geometryDownloadSizeBytes: 35 * 1024 * 1024,
      maximumNumberOfDrawCalls: 2000,
      maximumRenderCost: 20_000_000
    };
