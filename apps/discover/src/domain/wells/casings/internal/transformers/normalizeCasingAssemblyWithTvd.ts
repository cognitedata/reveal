import { convertDistance } from 'utils/units/convertDistance';

import { UserPreferredUnit } from 'constants/units';

import { CasingAssemblyInternalWithTvd, CasingAssemblyWithTvd } from '../types';

import { normalizeCasingAssembly } from './normalizeCasingAssembly';

export const normalizeCasingAssemblyWithTvd = (
  rawCasingAssemby: CasingAssemblyWithTvd,
  userPreferredUnit: UserPreferredUnit
): CasingAssemblyInternalWithTvd => {
  const { trueVerticalDepthTop, trueVerticalDepthBase } = rawCasingAssemby;

  return {
    ...normalizeCasingAssembly(rawCasingAssemby, userPreferredUnit),
    trueVerticalDepthTop:
      trueVerticalDepthTop &&
      convertDistance(trueVerticalDepthTop, userPreferredUnit),
    trueVerticalDepthBase:
      trueVerticalDepthBase &&
      convertDistance(trueVerticalDepthBase, userPreferredUnit),
  };
};
