import head from 'lodash/head';
import isUndefined from 'lodash/isUndefined';
import { Fixed } from 'utils/number';
import { changeUnitTo } from 'utils/units';

import { TrueVerticalDepths } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { KickoffDepth } from '../types';

export const normalizeKickoffDepth = (
  tvd: TrueVerticalDepths,
  userPreferredUnit: UserPreferredUnit
): KickoffDepth | undefined => {
  const {
    wellboreMatchingId,
    measuredDepths,
    trueVerticalDepths,
    trueVerticalDepthUnit,
  } = tvd;

  const measuredDepth = head(measuredDepths);
  const trueVerticalDepth = head(trueVerticalDepths);

  if (isUndefined(measuredDepth) || isUndefined(trueVerticalDepth)) {
    return undefined;
  }

  const convertedTVD = changeUnitTo(
    trueVerticalDepth,
    trueVerticalDepthUnit.unit,
    userPreferredUnit,
    Fixed.TwoDecimals
  );

  if (isUndefined(convertedTVD)) {
    return undefined;
  }

  return {
    wellboreMatchingId,
    measuredDepth,
    trueVerticalDepth: convertedTVD,
    unit: userPreferredUnit,
  };
};
