import { WellTopSurfaceInternal } from 'domain/wells/wellTops/internal/types';

import { Distance } from 'convert-units';

import { WellTopSurfaceView } from '../types';

import { getWellTopSurfaceDepthDifference } from './getWellTopSurfaceDepthDifference';
import { getWellTopSurfaceViewBase } from './getWellTopSurfaceViewBase';

export const adaptWellTopSurfacesToView = (
  wellboreMatchingId: string,
  depthUnit: Distance,
  wellTopSurfaces: WellTopSurfaceInternal[]
): WellTopSurfaceView[] => {
  return wellTopSurfaces
    .filter(({ top }) => top)
    .map((wellTopSurface, index) => {
      const { top, base: baseOriginal } = wellTopSurface;

      const base = getWellTopSurfaceViewBase(
        wellTopSurface,
        wellTopSurfaces[index + 1]
      );

      return {
        ...wellTopSurface,
        wellboreMatchingId,
        depthUnit,
        base,
        depthDifference: getWellTopSurfaceDepthDifference(top, base),
        isComputedBase: !baseOriginal,
      };
    });
};
