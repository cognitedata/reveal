import isUndefined from 'lodash/isUndefined';
import { toReadableInches } from 'utils/number/toReadableInches';
import { changeUnitTo } from 'utils/units/changeUnitTo';

import { DistanceUnitEnum, HoleSection } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { SIZE_UNIT } from '../../constants';
import { HOLE_SECTION_COLORS } from '../constants';
import { HoleSectionInternal } from '../types';

export const normalizeHoleSections = (
  holeSections: HoleSection[],
  sizeUnit: DistanceUnitEnum,
  measuredDepthUnit: DistanceUnitEnum,
  userPreferredUnit: UserPreferredUnit
): HoleSectionInternal[] => {
  return holeSections.map((holeSection, index) => {
    const { holeSize, bitSize, topMeasuredDepth, baseMeasuredDepth } =
      holeSection;

    const holeSizeConverted = isUndefined(holeSize)
      ? undefined
      : changeUnitTo(holeSize, sizeUnit, SIZE_UNIT);

    return {
      ...holeSection,
      holeSize: holeSizeConverted,
      holeSizeFormatted: isUndefined(holeSizeConverted)
        ? undefined
        : toReadableInches(holeSizeConverted),
      bitSize: isUndefined(bitSize)
        ? undefined
        : changeUnitTo(bitSize, sizeUnit, SIZE_UNIT),
      topMeasuredDepth: isUndefined(topMeasuredDepth)
        ? undefined
        : changeUnitTo(topMeasuredDepth, measuredDepthUnit, userPreferredUnit),
      baseMeasuredDepth: isUndefined(baseMeasuredDepth)
        ? undefined
        : changeUnitTo(baseMeasuredDepth, measuredDepthUnit, userPreferredUnit),
      color: HOLE_SECTION_COLORS[index % HOLE_SECTION_COLORS.length],
    };
  });
};
