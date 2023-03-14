import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { WellboreData } from '../types';

export const getWellboreData = (wellbore: WellboreInternal): WellboreData => {
  const {
    matchingId,
    wellName,
    name,
    color,
    wellWaterDepth,
    uniqueWellboreIdentifier,
    datum,
  } = wellbore;

  return {
    wellboreMatchingId: matchingId,
    wellName,
    wellboreName: name,
    wellboreColor: color,
    datum,
    wellWaterDepth,
    uniqueWellboreIdentifier,
  };
};
