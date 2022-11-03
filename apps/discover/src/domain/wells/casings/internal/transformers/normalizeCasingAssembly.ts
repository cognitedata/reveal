import uniqueId from 'lodash/uniqueId';
import { Fixed } from 'utils/number';
import { convertDistance } from 'utils/units/convertDistance';

import { CasingAssembly } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { CASING_ASSEMBLY_DIAMETER_UNIT } from '../constants';
import { CasingAssemblyInternal } from '../types';
import { isLiner } from '../utils/isLiner';

import { formatDiameter } from './formatOutsideDiameter';

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

  const minInsideDiameterConverted = convertDistance(
    minInsideDiameter,
    CASING_ASSEMBLY_DIAMETER_UNIT,
    Fixed.TwoDecimals
  );

  const minOutsideDiameterConverted = convertDistance(
    minOutsideDiameter,
    CASING_ASSEMBLY_DIAMETER_UNIT,
    Fixed.TwoDecimals
  );

  return {
    ...rest,
    id: uniqueId('casing-assembly-'),
    minInsideDiameter: minInsideDiameterConverted,
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
    outsideDiameterFormatted: formatDiameter(minOutsideDiameterConverted),
    insideDiameterFormatted: formatDiameter(minInsideDiameterConverted),
    isLiner: isLiner(rawCasingAssemby),
  };
};
