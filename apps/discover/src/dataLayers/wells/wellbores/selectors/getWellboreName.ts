import { Wellbore } from 'modules/wellSearch/types';

export const getWellboreName = (wellbore: Wellbore) => {
  return wellbore.name || wellbore.description || '';
};
