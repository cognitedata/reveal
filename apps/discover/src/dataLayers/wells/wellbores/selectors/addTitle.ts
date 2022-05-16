import { Wellbore } from 'modules/wellSearch/types';

import { getWellboreTitle } from '../decorators/getWellboreTitle';

export const addTitle = <T extends Wellbore>(wellbore: T) => {
  return {
    ...wellbore,
    title: getWellboreTitle(wellbore),
  };
};
