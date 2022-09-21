import { changeUnitTo } from 'utils/units/changeUnitTo';

import { DistanceUnitEnum, HoleSection } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { HoleSectionInternal } from '../types';

export const normalizeHoleSections = (
  holeSections: HoleSection[],
  measuredDepthUnit: DistanceUnitEnum,
  userPreferredUnit: UserPreferredUnit
): HoleSectionInternal[] => {
  return holeSections.map((holeSection) => {
    const { topMeasuredDepth, baseMeasuredDepth } = holeSection;

    return {
      ...holeSection,
      topMeasuredDepth:
        topMeasuredDepth &&
        changeUnitTo(topMeasuredDepth, measuredDepthUnit, userPreferredUnit),
      baseMeasuredDepth:
        baseMeasuredDepth &&
        changeUnitTo(baseMeasuredDepth, measuredDepthUnit, userPreferredUnit),
    };
  });
};
