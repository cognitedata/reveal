import isUndefined from 'lodash/isUndefined';
import { convertDistance } from 'utils/units/convertDistance';

import { Distance } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import {
  CasingCementingInternalWithTvd,
  CasingCementingWithTvd,
} from '../types';

import { normalizeCasingCementing } from './normalizeCasingCementing';

export const normalizeCasingCementingWithTvd = (
  rawCasingCementing: CasingCementingWithTvd,
  casingAssemblyMeasuredDepthBase: Distance,
  casingAssemblyTrueVerticalDepthBase: Distance | undefined,
  userPreferredUnit: UserPreferredUnit
): CasingCementingInternalWithTvd => {
  const {
    topTrueVerticalDepth,
    baseTrueVerticalDepth = casingAssemblyTrueVerticalDepthBase,
  } = rawCasingCementing;

  return {
    ...normalizeCasingCementing(
      rawCasingCementing,
      casingAssemblyMeasuredDepthBase,
      userPreferredUnit
    ),
    topTrueVerticalDepth: isUndefined(topTrueVerticalDepth)
      ? undefined
      : convertDistance(topTrueVerticalDepth, userPreferredUnit),
    baseTrueVerticalDepth: isUndefined(baseTrueVerticalDepth)
      ? undefined
      : convertDistance(baseTrueVerticalDepth, userPreferredUnit),
  };
};
