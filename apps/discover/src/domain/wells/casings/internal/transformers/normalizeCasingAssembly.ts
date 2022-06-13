import { Fixed } from 'utils/number';
import { convertDistance } from 'utils/units/convertDistance';

import { CasingAssembly } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

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
      'in',
      Fixed.TwoDecimals
    ),
    minOutsideDiameter: convertDistance(
      minOutsideDiameter,
      'in',
      Fixed.TwoDecimals
    ),
    maxOutsideDiameter: convertDistance(
      maxOutsideDiameter,
      'in',
      Fixed.TwoDecimals
    ),
    measuredDepthTop: convertDistance(
      originalMeasuredDepthTop,
      userPreferredUnit,
      Fixed.ThreeDecimals
    ),
    measuredDepthBase: convertDistance(
      originalMeasuredDepthBase,
      userPreferredUnit,
      Fixed.ThreeDecimals
    ),
  };
};
