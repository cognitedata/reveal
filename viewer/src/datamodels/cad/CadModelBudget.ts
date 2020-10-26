/*!
 * Copyright 2020 Cognite AS
 */

import { isMobileOrTablet } from '@/utilities';

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
};

export const defaultCadModelSectorBudget = isMobileOrTablet()
  ? // Mobile/tablet
    {
      highDetailProximityThreshold: 5 * 1000,
      geometryDownloadSizeBytes: 10 * 1024 * 1024
    }
  : // Desktop
    {
      highDetailProximityThreshold: 10 * 1000,
      geometryDownloadSizeBytes: 35 * 1024 * 1024
    };
