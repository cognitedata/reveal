/*!
 * Copyright 2021 Cognite AS
 */

import { isMobileOrTablet } from '@reveal/utilities';

/**
 * Represents a measurement of how much geometry can be loaded.
 */
export type CadModelBudget = {
  /**
   * Sectors within this distance from the camera will always be loaded in high details.
   * @deprecated This is only used for 3D models processed prior to the Reveal 3.0 release (Q1 2022).
   */
  readonly highDetailProximityThreshold: number;

  /**
   * Maximum render cost. This number can be thought of as triangle count, although the number
   * doesn't match this directly.
   */
  readonly maximumRenderCost: number;
};

export const defaultDesktopCadModelBudget: CadModelBudget = {
  highDetailProximityThreshold: 10,
  maximumRenderCost: 15_000_000
};

export const defaultMobileCadModelBudget: CadModelBudget = {
  highDetailProximityThreshold: 5,
  maximumRenderCost: 7_000_000
};

export function getDefaultCadModelBudget(): CadModelBudget {
  return isMobileOrTablet() ? defaultMobileCadModelBudget : defaultDesktopCadModelBudget;
}
