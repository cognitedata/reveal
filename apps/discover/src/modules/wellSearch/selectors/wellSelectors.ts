import { Well } from 'domain/wells/well/internal/types';

import pickBy from 'lodash/pickBy';
import { createSelector } from 'reselect';

import { StoreState } from 'core/types';
import { getIndeterminateWells } from 'modules/wellSearch/utils/wells';

export const selectedWellIdsSelector = createSelector(
  (state: StoreState) => state.wellSearch.selectedWellIds,
  (state: StoreState) => Object.keys(state.wellSearch.selectedWellIds),
  (selectedWellIds) => {
    return Object.keys(pickBy(selectedWellIds));
  }
);

// This returns indeterminate wells (Wells that some wellbores are selected but not all)
export const intermediateWellsSelector = createSelector(
  (state: StoreState) => state.wellSearch.selectedWellboreIds,
  (_state: StoreState, wells: Well[]) => ({ wells }),
  (selectedWellboreIds, { wells }) =>
    getIndeterminateWells(wells, selectedWellboreIds)
);
