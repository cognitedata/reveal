import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { getWellboreTitle } from './getWellboreTitle';

export const addTitle = <T extends WellboreInternal>(wellbore: T) => {
  return {
    ...wellbore,
    title: getWellboreTitle(wellbore),
  };
};
