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
  updateExtraGeoJsonAppliedFilters,
} from './actions';
import { SidebarState, SidebarActions } from './types';

export const initialState = {
  isOpen: true,
  category: 'landing',
  activeKeys: {
    documents: [],
    seismic: [],
    wells: [],
    landing: [],
  },
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
      state.isOpen = !state.isOpen;
    })
    .addCase(setCategoryPage, (state, action) => {
      state.category = action.payload;
    })
    .addCase(setCategoryFilter, (state, action) => {
      state.appliedFilters = action.payload;
    })
    .addCase(updateCategoryCollapseKey, (state, action) => {
      state.activeKeys[action.payload.category] = action.payload.value;
    })
    .addCase(updateCategoryAppliedFilter, (state, action) => {
      /**
       * There is no way this funciton to know specific types because
       * they are inferred by where it is called.
       */
      if (action.payload) {
        (state as any).appliedFilters[action.payload.category][
          action.payload.facet
        ] = action.payload.value;
      }
    })
    .addCase(updateCategoryAppliedFilters, (state, action) => {
      (state as any).appliedFilters[action.payload.category] =
        action.payload.value;
      if ('extraDocumentFilters' in action.payload) {
        state.appliedFilters.extraDocumentsFilters =
          action.payload.extraDocumentFilters;
      }
    })
    .addCase(setSearchPhrase, (state, action) => {
      state.searchPhrase = action.payload;
    })
    .addCase(updateExtraGeoJsonAppliedFilters, (state, action) => {
      state.appliedFilters.extraGeoJsonFilters = action.payload;
    });
});

export const sidebar = (
  state: SidebarState | undefined,
  action: SidebarActions
): SidebarState => {
  return runTimeConfigReducerCreator(state, action);
};

export default sidebar;
