import pickBy from 'lodash/pickBy';
import { createSelector } from 'reselect';

import { StoreState } from 'core/types';
import { Well } from 'modules/wellSearch/types';
import { getIndeterminateWells } from 'modules/wellSearch/utils/wells';

export const selectedWellIdsSelector = createSelector(
  (state: StoreState) => state.wellSearch.selectedWellIds,
  (state: StoreState) => Object.keys(state.wellSearch.selectedWellIds),
  (_state: StoreState, enabledWellSDKV3: boolean) => enabledWellSDKV3,
  (selectedWellIds, enabledWellSDKV3) => {
    const selectedIds = Object.keys(pickBy(selectedWellIds));
    return enabledWellSDKV3
      ? (selectedIds as unknown as number[])
      : selectedIds.map(Number);
  }
);

// This returns indeterminate wells (Wells that some wellbores are selected but not all)
export const intermediateWellsSelector = createSelector(
  (state: StoreState) => state.wellSearch.selectedWellboreIds,
  (_state: StoreState, wells: Well[]) => ({ wells }),
  (selectedWellboreIds, { wells }) =>
    getIndeterminateWells(wells, selectedWellboreIds)
);
