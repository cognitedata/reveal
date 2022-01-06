import { createSelector } from 'reselect';

import { StoreState } from 'core/types';

export const wellboreDataSelector = createSelector(
  (state: StoreState) => state.wellSearch.wellboreData,
  (wellboreData) => wellboreData
);
