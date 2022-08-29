import { MaxDepthData } from 'domain/wells/trajectory/internal/types';
import {
  WellTopSurfaceDepthInternal,
  WellTopSurfaceInternal,
} from 'domain/wells/wellTops/internal/types';

export const getWellTopSurfaceViewBase = (
  currentWellTopSurface: WellTopSurfaceInternal,
  maxDepth: MaxDepthData,
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
   * In that case, take the max depth as the base.
   */
  return {
    measuredDepth: maxDepth.maxMeasuredDepth,
    trueVerticalDepth: maxDepth.maxTrueVerticalDepth,
  };
};
