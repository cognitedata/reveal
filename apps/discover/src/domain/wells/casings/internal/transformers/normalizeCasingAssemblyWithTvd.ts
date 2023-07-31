import { convertDistance } from 'utils/units/convertDistance';

import { UserPreferredUnit } from 'constants/units';

import { CasingAssemblyInternalWithTvd, CasingAssemblyWithTvd } from '../types';

import { normalizeCasingAssembly } from './normalizeCasingAssembly';
import { normalizeCasingCementingWithTvd } from './normalizeCasingCementingWithTvd';

export const normalizeCasingAssemblyWithTvd = (
  rawCasingAssemby: CasingAssemblyWithTvd,
  userPreferredUnit: UserPreferredUnit
): CasingAssemblyInternalWithTvd => {
  const {
    originalMeasuredDepthBase,
    trueVerticalDepthTop,
    trueVerticalDepthBase,
    cementing,
  } = rawCasingAssemby;

  return {
    ...normalizeCasingAssembly(rawCasingAssemby, userPreferredUnit),
    trueVerticalDepthTop:
      trueVerticalDepthTop &&
      convertDistance(trueVerticalDepthTop, userPreferredUnit),
    trueVerticalDepthBase:
      trueVerticalDepthBase &&
      convertDistance(trueVerticalDepthBase, userPreferredUnit),
    cementing:
      cementing &&
      normalizeCasingCementingWithTvd(
        cementing,
        originalMeasuredDepthBase,
        trueVerticalDepthBase,
        userPreferredUnit
      ),
  };
};
