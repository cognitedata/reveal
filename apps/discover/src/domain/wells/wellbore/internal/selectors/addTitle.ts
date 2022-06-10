import { Wellbore } from 'domain/wells/wellbore/internal/types';

import { getWellboreTitle } from './getWellboreTitle';

export const addTitle = <T extends Wellbore>(wellbore: T) => {
  return {
    ...wellbore,
    title: getWellboreTitle(wellbore),
  };
};
