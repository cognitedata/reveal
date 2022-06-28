import { convertDistance } from 'utils/units/convertDistance';

import { Nds } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

import { NdsInternal } from '../types';

export const normalizeNds = (
  rawNds: Nds,
  userPreferredUnit: UserPreferredUnit
): NdsInternal => {
  const { holeDiameter, holeStart, holeEnd } = rawNds;

  return {
    ...rawNds,
    holeDiameter:
      holeDiameter && convertDistance(holeDiameter, userPreferredUnit),
    holeStart: holeStart && convertDistance(holeStart, userPreferredUnit),
    holeEnd: holeEnd && convertDistance(holeEnd, userPreferredUnit),
  };
};
