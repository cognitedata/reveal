import isUndefined from 'lodash/isUndefined';
import { convertDistance } from 'utils/units/convertDistance';

import { CasingCementing, Distance } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { CasingCementingInternal } from '../types';

export const normalizeCasingCementing = (
  rawCasingCementing: CasingCementing,
  casingAssemblyMeasuredDepthBase: Distance,
  userPreferredUnit: UserPreferredUnit
): CasingCementingInternal => {
  const {
    topMeasuredDepth,
    baseMeasuredDepth = casingAssemblyMeasuredDepthBase,
  } = rawCasingCementing;

  return {
    topMeasuredDepth: isUndefined(topMeasuredDepth)
      ? undefined
      : convertDistance(topMeasuredDepth, userPreferredUnit),
    baseMeasuredDepth: isUndefined(baseMeasuredDepth)
      ? undefined
      : convertDistance(baseMeasuredDepth, userPreferredUnit),
  };
};
