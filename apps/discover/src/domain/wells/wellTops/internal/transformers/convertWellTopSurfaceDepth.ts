import { Distance } from 'convert-units';
import { changeUnitTo } from 'utils/units/changeUnitTo';

import { UserPreferredUnit } from 'constants/units';

import { WellTopSurfaceDepthInternal } from '../types';

export const convertWellTopSurfaceDepth = (
  userPreferredUnit: UserPreferredUnit,
  measuredDepthUnit: Distance,
  trueVerticalDepthUnit: Distance,
  top: WellTopSurfaceDepthInternal
): WellTopSurfaceDepthInternal => {
  return {
    measuredDepth:
      changeUnitTo(top.measuredDepth, measuredDepthUnit, userPreferredUnit) ||
      0,
    trueVerticalDepth:
      changeUnitTo(
        top.trueVerticalDepth || 0,
        trueVerticalDepthUnit,
        userPreferredUnit
      ) || 0,
  };
};
