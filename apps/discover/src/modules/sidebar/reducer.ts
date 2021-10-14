import { createReducer } from '@reduxjs/toolkit';

import { getEmptyFacets } from 'modules/documentSearch/utils';

import {
  toggleFilterBar,
  setCategoryPage,
  setCategoryFilter,
  updateCategoryCollapseKey,
  updateCategoryAppliedFilter,
  updateCategoryAppliedFilters,
  setSearchPhrase,
} from './actions';
import { SidebarState, SidebarActions } from './types';

export const initialState = {
  isOpen: true,
  category: 'landing',
  activeKeys: { documents: [], seismic: [], wells: [], landing: [] },
  appliedFilters: {
    documents: getEmptyFacets(),
    seismic: {},
    wells: {},
    landing: {},
  },
  searchPhrase: '',
} as SidebarState;

const runTimeConfigReducerCreator = createReducer(initialState, (builder) => {
  builder
    .addCase(toggleFilterBar, (state) => {
      // eslint-disable-next-line no-param-reassign
      state.isOpen = !state.isOpen;
    })
    .addCase(setCategoryPage, (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.category = action.payload;
    })
    .addCase(setCategoryFilter, (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.appliedFilters = action.payload;
    })
    .addCase(updateCategoryCollapseKey, (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.activeKeys[action.payload.category] = action.payload.value;
    })
    .addCase(updateCategoryAppliedFilter, (state, action) => {
      /**
       * There is no way this funciton to know secific types becase they are inferred by
       * where it is called.
       */
      // eslint-disable-next-line no-param-reassign
      (state as any).appliedFilters[action.payload.category][
        action.payload.facet
      ] = action.payload.value;
    })
    .addCase(updateCategoryAppliedFilters, (state, action) => {
      // eslint-disable-next-line no-param-reassign
      (state as any).appliedFilters[action.payload.category] =
        action.payload.value;
    })
    .addCase(setSearchPhrase, (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.searchPhrase = action.payload;
    });
});

export const sidebar = (
  state: SidebarState | undefined,
  action: SidebarActions
): SidebarState => {
  return runTimeConfigReducerCreator(state, action);
};

export default sidebar;
