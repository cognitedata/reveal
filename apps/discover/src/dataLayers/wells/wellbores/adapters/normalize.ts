import { Wellbore } from 'modules/wellSearch/types';

export const normalize = (rawAPIWellbore: Wellbore): Wellbore => {
  return {
    ...rawAPIWellbore,
  };
};
