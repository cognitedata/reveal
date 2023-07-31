import { Modules } from './types';

export const TOGGLE_FILTER_BAR = 'sidebar/toggleFilterBar';
export const SET_CATEGORY_PAGE = 'sidebar/setCategoryPage';
export const SET_CATEGORY_FILTERS = 'sidebar/setCategoryFilters';
export const UPDATE_CATEGORY_COLLAPSE_KEY = 'sidebar/updateCategoryKey';
export const UPDATE_CATEGORY_APPLIED_FILTER =
  'sidebar/updateCategoryAppliedFiler';
export const UPDATE_CATEGORY_APPLIED_FILTERS =
  'sidebar/updateCategoryAppliedFilers';
export const SET_SEARCH_PHRASE = 'sidebar/setSearchPhrase';
export const UPDATE_EXTRA_GEO_APPLIED_FILTERS =
  'sidebar/updateExtraGeoJsonAppliedFilters';

export const FILTER_CATEGORIES = [
  {
    title: 'Documents',
    name: Modules.DOCUMENTS,
    module: Modules.DOCUMENTS,
  },
  {
    title: 'Wells',
    name: Modules.WELLS,
    module: Modules.WELLS,
  },
  {
    title: 'Seismic',
    name: Modules.SEISMIC,
    module: Modules.SEISMIC,
  },
];
