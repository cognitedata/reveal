import isUndefined from 'lodash/isUndefined';
import uniqueId from 'lodash/uniqueId';
import { Fixed } from 'utils/number';
import { toReadableInches } from 'utils/number/toReadableInches';
import { changeUnitTo } from 'utils/units/changeUnitTo';

import { DistanceUnitEnum, HoleSection } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { SIZE_UNIT } from '../../constants';
import { HOLE_SECTION_COLORS } from '../constants';
import { HoleSectionInternal } from '../types';

export const normalizeHoleSection = (
  holeSection: HoleSection,
  sizeUnit: DistanceUnitEnum,
  measuredDepthUnit: DistanceUnitEnum,
  userPreferredUnit: UserPreferredUnit,
  index = 0
): HoleSectionInternal => {
  const { holeSize, bitSize, topMeasuredDepth, baseMeasuredDepth } =
    holeSection;

  const holeSizeConverted = isUndefined(holeSize)
    ? undefined
    : changeUnitTo(holeSize, sizeUnit, SIZE_UNIT);

  return {
    ...holeSection,
    id: uniqueId('hole-section-'),
    holeSize: holeSizeConverted,
    holeSizeFormatted: isUndefined(holeSizeConverted)
      ? undefined
      : toReadableInches(holeSizeConverted),
    bitSize: isUndefined(bitSize)
      ? undefined
      : changeUnitTo(bitSize, sizeUnit, SIZE_UNIT),
    topMeasuredDepth: isUndefined(topMeasuredDepth)
      ? undefined
      : changeUnitTo(
          topMeasuredDepth,
          measuredDepthUnit,
          userPreferredUnit,
          Fixed.TwoDecimals
        ),
    baseMeasuredDepth: isUndefined(baseMeasuredDepth)
      ? undefined
      : changeUnitTo(
          baseMeasuredDepth,
          measuredDepthUnit,
          userPreferredUnit,
          Fixed.TwoDecimals
        ),
    color: HOLE_SECTION_COLORS[index % HOLE_SECTION_COLORS.length],
  };
};
