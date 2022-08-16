import { colorize } from 'utils/colorize/colorize';
import { toDistance } from 'utils/units/toDistance';

import { WellTops } from '@cognite/sdk-wells/dist/src';

import { UserPreferredUnit } from 'constants/units';

import { WellTopsInternal } from '../types';

import { convertWellTopSurfaceDepth } from './convertWellTopSurfaceDepth';

export const normalizeWellTops = (
  welltops: WellTops[],
  userPreferredUnit: UserPreferredUnit
): WellTopsInternal[] => {
  return welltops.map((welltop) => {
    const { tops } = welltop;
    const sortedWellTopSurfaces = tops.sort(
      (a, b) => a.top.measuredDepth - b.top.measuredDepth
    );
    const welltopsNames = tops.map((top) => top.name);
    const wellTopsColorMap = colorize(welltopsNames);
    const convertedMeasuredDepthUnit = toDistance(welltop.measuredDepthUnit);
    const convertedTrueVerticalDepthUnit = toDistance(
      welltop.trueVerticalDepthUnit
    );

    return {
      ...welltop,
      measuredDepthUnit: convertedMeasuredDepthUnit,
      trueVerticalDepthUnit: convertedTrueVerticalDepthUnit,

      tops: sortedWellTopSurfaces.map((wellTopSurface) => {
        return {
          ...wellTopSurface,
          top: convertWellTopSurfaceDepth(
            userPreferredUnit,
            convertedMeasuredDepthUnit,
            convertedTrueVerticalDepthUnit,
            wellTopSurface.top
          ),
          base:
            wellTopSurface.base &&
            convertWellTopSurfaceDepth(
              userPreferredUnit,
              convertedMeasuredDepthUnit,
              convertedTrueVerticalDepthUnit,
              wellTopSurface.base
            ),
          color: wellTopsColorMap[wellTopSurface.name],
          heightDifference:
            (wellTopSurface.base?.measuredDepth || 0) -
            wellTopSurface.top.measuredDepth,
        };
      }),
    };
  });
};
