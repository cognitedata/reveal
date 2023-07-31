import { WellTopSurfaceDepthInternal } from 'domain/wells/wellTops/internal/types';

import { toFixedNumberFromNumber } from 'utils/number';

export const getWellTopSurfaceDepthDifference = (
  wellTopSurface1: WellTopSurfaceDepthInternal,
  wellTopSurface2: WellTopSurfaceDepthInternal
): WellTopSurfaceDepthInternal => {
  const measuredDepth = Math.abs(
    wellTopSurface1.measuredDepth - wellTopSurface2.measuredDepth
  );

  let trueVerticalDepth: number | undefined;

  if (wellTopSurface1.trueVerticalDepth && wellTopSurface2.trueVerticalDepth) {
    trueVerticalDepth = Math.abs(
      wellTopSurface1.trueVerticalDepth - wellTopSurface2.trueVerticalDepth
    );
  }

  return {
    measuredDepth: toFixedNumberFromNumber(measuredDepth),
    trueVerticalDepth:
      trueVerticalDepth && toFixedNumberFromNumber(trueVerticalDepth),
  };
};
