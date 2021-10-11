import { createAction } from '@reduxjs/toolkit';

import {
  TOGGLE_FILTER_BAR,
  SET_CATEGORY_PAGE,
  SET_CATEGORY_FILTERS,
  UPDATE_CATEGORY_COLLAPSE_KEY,
  UPDATE_CATEGORY_APPLIED_FILTER,
  UPDATE_CATEGORY_APPLIED_FILTERS,
  SET_SEARCH_PHRASE,
} from './constants';
import {
  CategoryTypes,
  UpdateCategoryCollapseKeyType,
  AppliedFiltersType,
  UpdateCategoryAppliedFilterType,
  AppliedFilterFacetValueUpdateType,
} from './types';

export const toggleFilterBar = createAction(TOGGLE_FILTER_BAR);
export const setCategoryPage = createAction<CategoryTypes>(SET_CATEGORY_PAGE);
export const setCategoryFilter =
  createAction<AppliedFiltersType>(SET_CATEGORY_FILTERS);
export const updateCategoryCollapseKey =
  createAction<UpdateCategoryCollapseKeyType>(UPDATE_CATEGORY_COLLAPSE_KEY);
export const updateCategoryAppliedFilter =
  createAction<AppliedFilterFacetValueUpdateType>(
    UPDATE_CATEGORY_APPLIED_FILTER
  );
export const updateCategoryAppliedFilters =
  createAction<UpdateCategoryAppliedFilterType>(
    UPDATE_CATEGORY_APPLIED_FILTERS
  );
export const setSearchPhrase = createAction<string>(SET_SEARCH_PHRASE);
