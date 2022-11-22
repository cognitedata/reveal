import { convertDistance } from 'utils/units/convertDistance';
import { convertLinearWeight } from 'utils/units/convertLinearWeight';

import { CasingComponent } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { CASING_ASSEMBLY_DIAMETER_UNIT } from '../constants';
import { CasingComponentInternal } from '../types';

export const normalizeCasingComponent = (
  rawCasingComponent: CasingComponent,
  userPreferredUnit: UserPreferredUnit
): CasingComponentInternal => {
  const {
    minInsideDiameter,
    maxOutsideDiameter,
    topMeasuredDepth,
    baseMeasuredDepth,
    linearWeight,
  } = rawCasingComponent;

  return {
    ...rawCasingComponent,
    minInsideDiameter:
      minInsideDiameter &&
      convertDistance(minInsideDiameter, CASING_ASSEMBLY_DIAMETER_UNIT),
    maxOutsideDiameter:
      maxOutsideDiameter &&
      convertDistance(maxOutsideDiameter, CASING_ASSEMBLY_DIAMETER_UNIT),
    topMeasuredDepth:
      topMeasuredDepth && convertDistance(topMeasuredDepth, userPreferredUnit),
    baseMeasuredDepth:
      baseMeasuredDepth &&
      convertDistance(baseMeasuredDepth, userPreferredUnit),
    linearWeight:
      linearWeight && convertLinearWeight(linearWeight, userPreferredUnit),
  };
};
