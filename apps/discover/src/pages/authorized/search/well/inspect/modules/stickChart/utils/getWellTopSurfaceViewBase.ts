import {
  WellTopSurfaceDepthInternal,
  WellTopSurfaceInternal,
} from 'domain/wells/wellTops/internal/types';

export const getWellTopSurfaceViewBase = (
  currentWellTopSurface: WellTopSurfaceInternal,
  nextWellTopSurface?: WellTopSurfaceInternal
): WellTopSurfaceDepthInternal => {
  // If current well top surface has base value.
  if (currentWellTopSurface.base) {
    return currentWellTopSurface.base;
  }

  // If next well top surface has base value
  if (nextWellTopSurface) {
    return nextWellTopSurface.top;
  }

  /**
   * If next well top surface is undefined,
   * it means the current well top surface is the last one.
   * In that case, take the top depth as the base.
   * This makes the depth difference 0 and a formation block will not be rendered.
   */
  return currentWellTopSurface.top;
};
