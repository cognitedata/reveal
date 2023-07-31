import isUndefined from 'lodash/isUndefined';
import { Fixed } from 'utils/number';
import { changeUnitTo } from 'utils/units/changeUnitTo';

import { DistanceUnitEnum } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { HoleSectionInternalWithTvd, HoleSectionWithTvd } from '../types';

import { normalizeHoleSection } from './normalizeHoleSection';

export const normalizeHoleSectionWithTvd = (
  holeSection: HoleSectionWithTvd,
  sizeUnit: DistanceUnitEnum,
  measuredDepthUnit: DistanceUnitEnum,
  trueVerticalDepthUnit: DistanceUnitEnum,
  userPreferredUnit: UserPreferredUnit,
  index = 0
): HoleSectionInternalWithTvd => {
  const { topTrueVerticalDepth, baseTrueVerticalDepth } = holeSection;

  return {
    ...normalizeHoleSection(
      holeSection,
      sizeUnit,
      measuredDepthUnit,
      userPreferredUnit,
      index
    ),
    topTrueVerticalDepth: isUndefined(topTrueVerticalDepth)
      ? undefined
      : changeUnitTo(
          topTrueVerticalDepth,
          trueVerticalDepthUnit,
          userPreferredUnit,
          Fixed.TwoDecimals
        ),
    baseTrueVerticalDepth: isUndefined(baseTrueVerticalDepth)
      ? undefined
      : changeUnitTo(
          baseTrueVerticalDepth,
          trueVerticalDepthUnit,
          userPreferredUnit,
          Fixed.TwoDecimals
        ),
  };
};
