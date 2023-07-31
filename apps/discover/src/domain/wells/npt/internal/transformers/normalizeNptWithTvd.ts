import { ColorMap } from 'utils/colorize';
import { convertDistance } from 'utils/units/convertDistance';

import { UserPreferredUnit } from 'constants/units';

import { NptInternalWithTvd, NptWithTvd } from '../types';

import { normalizeNpt } from './normalizeNpt';

export const normalizeNptWithTvd = (
  rawNpt: NptWithTvd,
  userPreferredUnit: UserPreferredUnit,
  nptCodeColorMap: ColorMap
): NptInternalWithTvd => {
  const { trueVerticalDepth } = rawNpt;

  return {
    ...normalizeNpt(rawNpt, userPreferredUnit, nptCodeColorMap),
    trueVerticalDepth:
      trueVerticalDepth &&
      convertDistance(trueVerticalDepth, userPreferredUnit),
  };
};
