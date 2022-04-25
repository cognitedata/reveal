import { Wellbore } from '@cognite/sdk-wells-v2';

import { getWellboreTitle } from '../decorators/getWellboreTitle';

export const addTitle = <T extends Wellbore>(wellbore: T) => {
  return {
    ...wellbore,
    title: getWellboreTitle(wellbore),
  };
};
