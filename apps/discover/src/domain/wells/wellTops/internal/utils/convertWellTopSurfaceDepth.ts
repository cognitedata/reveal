import isUndefined from 'lodash/isUndefined';
import { changeUnitTo } from 'utils/units/changeUnitTo';

import { DistanceUnitEnum } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { WellTopSurfaceDepthInternal } from '../types';

export const convertWellTopSurfaceDepth = <
  T extends WellTopSurfaceDepthInternal
>(
  wellTopSurfaceDepth: T,
  measuredDepthUnit: DistanceUnitEnum,
  trueVerticalDepthUnit: DistanceUnitEnum,
  userPreferredUnit: UserPreferredUnit
): T | undefined => {
  const { measuredDepth, trueVerticalDepth } = wellTopSurfaceDepth;

  const convertedMeasuredDepth = changeUnitTo(
    measuredDepth,
    measuredDepthUnit,
    userPreferredUnit
  );

  if (isUndefined(convertedMeasuredDepth)) {
    return undefined;
  }

  const convertedTrueVerticalDepth =
    trueVerticalDepth &&
    changeUnitTo(trueVerticalDepth, trueVerticalDepthUnit, userPreferredUnit);

  return {
    ...wellTopSurfaceDepth,
    measuredDepth: convertedMeasuredDepth,
    trueVerticalDepth: convertedTrueVerticalDepth,
  };
};
