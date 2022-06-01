import { Wellbore } from 'domain/wells/wellbore/internal/types';

export const getWellboreName = (wellbore: Wellbore) => {
  return wellbore.name || wellbore.description || '';
};
