import { getRkbLevel } from 'domain/wells/wellbore/internal/selectors/getRkbLevel';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { WellboreData } from '../types';

export const getWellboreData = (wellbore: WellboreInternal): WellboreData => {
  const { matchingId, wellName, name, color, wellWaterDepth } = wellbore;

  return {
    wellboreMatchingId: matchingId,
    wellName,
    wellboreName: name,
    wellboreColor: color,
    rkbLevel: getRkbLevel(wellbore),
    wellWaterDepth,
  };
};
