/*!
 * Copyright 2020 Cognite AS
 */

import { isMobileOrTablet } from '../../utilities';

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
   * Maximum number of estimated drawcalls of geometry to load.
   */
  readonly maximumNumberOfDrawCalls: number;
};

export const defaultCadModelSectorBudget: CadModelSectorBudget = isMobileOrTablet()
  ? // Mobile/tablet
    {
      highDetailProximityThreshold: 5,
      geometryDownloadSizeBytes: 20 * 1024 * 1024,
      maximumNumberOfDrawCalls: 700
    }
  : // Desktop
    {
      highDetailProximityThreshold: 10,
      geometryDownloadSizeBytes: 35 * 1024 * 1024,
      maximumNumberOfDrawCalls: 2000
    };
