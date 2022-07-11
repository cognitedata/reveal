import { sortObjectsAscending } from 'utils/sort';

import { WellInternal } from '../types';

export const sortWellsByName = (wellbores: WellInternal[]) => {
  return sortObjectsAscending(wellbores, 'name');
};
