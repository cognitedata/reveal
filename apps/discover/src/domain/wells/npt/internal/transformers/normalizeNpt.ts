import { convertDistance } from 'utils/units/convertDistance';

import { Npt } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

import { NptInternal } from '../types';

export const normalizeNpt = (
  rawNpt: Npt,
  userPreferredUnit: UserPreferredUnit
): NptInternal => {
  const { measuredDepth } = rawNpt;

  return {
    ...rawNpt,
    measuredDepth: measuredDepth
      ? convertDistance(measuredDepth, userPreferredUnit)
      : undefined,
  };
};
