import { Well, Wellbore } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

import { WellboreInternal } from '../types';

import { normalizeDatum } from './normalizeDatum';

export const normalizeWellbore = (
  rawWell: Well,
  rawWellbore: Wellbore,
  userPreferredUnit: UserPreferredUnit
): WellboreInternal => {
  const { matchingId: wellMatchingId, name: wellName } = rawWell;
  const { matchingId, datum } = rawWellbore;

  return {
    ...rawWellbore,
    id: matchingId,
    wellMatchingId,
    wellId: wellMatchingId,
    wellName,
    datum: datum && normalizeDatum(datum, userPreferredUnit),
  };
};
