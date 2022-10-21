import { Fixed } from 'utils/number';
import { convertDistance } from 'utils/units/convertDistance';

import { CasingAssembly } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { CASING_ASSEMBLY_DIAMETER_UNIT } from '../constants';
import { CasingAssemblyInternal } from '../types';
import { isLiner } from '../utils/isLiner';

import { formatOutsideDiameter } from './formatOutsideDiameter';

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

  const minOutsideDiameterConverted = convertDistance(
    minOutsideDiameter,
    CASING_ASSEMBLY_DIAMETER_UNIT,
    Fixed.TwoDecimals
  );

  return {
    ...rest,
    minInsideDiameter: convertDistance(
      minInsideDiameter,
      CASING_ASSEMBLY_DIAMETER_UNIT,
      Fixed.TwoDecimals
    ),
    minOutsideDiameter: minOutsideDiameterConverted,
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
    outsideDiameterFormatted: formatOutsideDiameter(
      minOutsideDiameterConverted
    ),
    isLiner: isLiner(rawCasingAssemby),
  };
};
