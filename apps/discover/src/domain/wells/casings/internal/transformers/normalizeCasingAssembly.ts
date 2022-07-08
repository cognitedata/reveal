import { Fixed } from 'utils/number';
import { convertDistance } from 'utils/units/convertDistance';

import { CasingAssembly } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { CASING_ASSEMBLY_DIAMETER_UNIT } from '../constants';
import { CasingAssemblyInternal } from '../types';

export const normalizeCasingAssembly = (
  rawCasingAssemby: CasingAssembly,
  userPreferredUnit: UserPreferredUnit
): CasingAssemblyInternal => {
  const {
    minInsideDiameter,
    minOutsideDiameter,
    maxOutsideDiameter,
    originalMeasuredDepthTop,
    originalMeasuredDepthBase,
    ...rest
  } = rawCasingAssemby;

  return {
    ...rest,
    minInsideDiameter: convertDistance(
      minInsideDiameter,
      CASING_ASSEMBLY_DIAMETER_UNIT,
      Fixed.TwoDecimals
    ),
    minOutsideDiameter: convertDistance(
      minOutsideDiameter,
      CASING_ASSEMBLY_DIAMETER_UNIT,
      Fixed.TwoDecimals
    ),
    maxOutsideDiameter: convertDistance(
      maxOutsideDiameter,
      CASING_ASSEMBLY_DIAMETER_UNIT,
      Fixed.TwoDecimals
    ),
    measuredDepthTop: convertDistance(
      originalMeasuredDepthTop,
      userPreferredUnit
    ),
    measuredDepthBase: convertDistance(
      originalMeasuredDepthBase,
      userPreferredUnit
    ),
  };
};
