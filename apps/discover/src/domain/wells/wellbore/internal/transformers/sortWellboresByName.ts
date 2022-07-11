import { sortObjectsAscending } from 'utils/sort';

import { WellboreInternal } from '../types';

export const sortWellboresByName = (wellbores: WellboreInternal[]) => {
  return sortObjectsAscending(wellbores, 'name');
};
