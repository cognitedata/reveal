import { normalizeWellbore } from 'domain/wells/wellbore/internal/transformers/normalizeWellbore';

import { convertDistance } from 'utils/units/convertDistance';

import { Well } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { WellInternal } from '../types';

import { normalizeCoords } from './normalizeCoords';

export const normalizeWell = (
  rawWell: Well,
  userPreferredUnit: UserPreferredUnit
): WellInternal => {
  const {
    matchingId,
    wellhead,
    wellbores = [],
    spudDate,
    waterDepth,
    sources,
  } = rawWell;

  return {
    ...rawWell,
    ...normalizeCoords(wellhead),
    id: matchingId,
    wellbores: wellbores.map((rawWellbore) =>
      normalizeWellbore(rawWell, rawWellbore, userPreferredUnit)
    ),
    spudDate: spudDate ? new Date(spudDate) : undefined,
    waterDepth: waterDepth && convertDistance(waterDepth, userPreferredUnit),
    sourceList: sources.map(({ sourceName }) => sourceName).join(', '),
  };
};
