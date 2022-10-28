import { ColorMap } from 'utils/colorize';
import { convertDistance } from 'utils/units/convertDistance';

import { UserPreferredUnit } from 'constants/units';

import { NdsInternalWithTvd, NdsWithTvd } from '../types';

import { normalizeNds } from './normalizeNds';

export const normalizeNdsWithTvd = (
  rawNds: NdsWithTvd,
  userPreferredUnit: UserPreferredUnit,
  ndsCodeColorMap: ColorMap
): NdsInternalWithTvd => {
  const { holeTopTvd, holeBaseTvd } = rawNds;

  return {
    ...normalizeNds(rawNds, userPreferredUnit, ndsCodeColorMap),
    holeTopTvd: holeTopTvd && convertDistance(holeTopTvd, userPreferredUnit),
    holeBaseTvd: holeBaseTvd && convertDistance(holeBaseTvd, userPreferredUnit),
  };
};
