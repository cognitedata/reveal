import { normalizeWellbores } from 'domain/wells/wellbore/internal/transformers/normalizeWellbores';

import { convertDistance } from 'utils/units/convertDistance';

import { Well } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { WellInternal } from '../types';

export const normalizeWell = (
  rawWell: Well,
  userPreferredUnit: UserPreferredUnit
): WellInternal => {
  const { matchingId, spudDate, waterDepth, sources } = rawWell;

  return {
    ...rawWell,
    id: matchingId,
    geometry: {
      type: 'Point',
      coordinates: [Number(rawWell.wellhead.x), Number(rawWell.wellhead.y)],
    },
    wellbores: normalizeWellbores(rawWell, userPreferredUnit),
    spudDate: spudDate ? new Date(spudDate) : undefined,
    waterDepth: waterDepth && convertDistance(waterDepth, userPreferredUnit),
    sourceList: sources.map(({ sourceName }) => sourceName).join(', '),
  };
};
