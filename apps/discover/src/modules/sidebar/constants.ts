import { Modules } from 'modules/sidebar/types';

export const TOGGLE_FILTER_BAR = 'sidebar/toggleFilterBar';
export const SET_CATEGORY_PAGE = 'sidebar/setCategoryPage';
export const SET_CATEGORY_FILTERS = 'sidebar/setCategoryFilters';
export const UPDATE_CATEGORY_COLLAPSE_KEY = 'sidebar/updateCategoryKey';
export const UPDATE_CATEGORY_APPLIED_FILTER =
  'sidebar/updateCategoryAppliedFiler';
export const UPDATE_CATEGORY_APPLIED_FILTERS =
  'sidebar/updateCategoryAppliedFilers';
export const SET_SEARCH_PHRASE = 'sidebar/setSearchPhrase';

export const FILTER_CATEGORIES = [
  {
    title: 'Documents',
    name: Modules.DOCUMENTS,
    module: Modules.DOCUMENTS,
  },
  {
    title: 'Seismic',
    name: Modules.SEISMIC,
    module: Modules.SEISMIC,
  },
  {
    title: 'Wells',
    name: Modules.WELLS,
    module: Modules.WELLS,
  },
];
