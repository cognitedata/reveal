import { Wellbore } from 'domain/wells/wellbore/internal/types';

import { getWellboreName } from '../selectors/getWellboreName';

export const getWellboreTitle = (wellbore: Wellbore) => {
  const name = getWellboreName(wellbore);

  if (name === wellbore.description) {
    return name;
  }

  return `${wellbore.description} ${name}`.trim();
};
