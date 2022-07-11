import { normalizeWellbores } from 'domain/wells/wellbore/internal/transformers/normalizeWellbores';

import { convertDistance } from 'utils/units/convertDistance';

import { Well } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { WellInternal } from '../types';

import { normalizeCoords } from './normalizeCoords';

export const normalizeWell = (
  rawWell: Well,
  userPreferredUnit: UserPreferredUnit
): WellInternal => {
  const { matchingId, wellhead, spudDate, waterDepth, sources } = rawWell;

  return {
    ...rawWell,
    ...normalizeCoords(wellhead),
    id: matchingId,
    wellbores: normalizeWellbores(rawWell, userPreferredUnit),
    spudDate: spudDate ? new Date(spudDate) : undefined,
    waterDepth: waterDepth && convertDistance(waterDepth, userPreferredUnit),
    sourceList: sources.map(({ sourceName }) => sourceName).join(', '),
  };
};
