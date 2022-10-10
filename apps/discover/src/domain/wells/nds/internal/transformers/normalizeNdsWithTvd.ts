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
  const { holeStartTvd, holeEndTvd } = rawNds;

  return {
    ...normalizeNds(rawNds, userPreferredUnit, ndsCodeColorMap),
    holeStartTvd:
      holeStartTvd && convertDistance(holeStartTvd, userPreferredUnit),
    holeEndTvd: holeEndTvd && convertDistance(holeEndTvd, userPreferredUnit),
  };
};
