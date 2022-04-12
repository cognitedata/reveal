import {
  getMockDocumentFilter,
  getMockAppliedFiltersType,
} from '__test-utils/fixtures/sidebar';

import {
  toggleFilterBar,
  setCategoryPage,
  updateCategoryAppliedFilter,
  updateCategoryAppliedFilters,
  updateCategoryCollapseKey,
  setCategoryFilter,
  setSearchPhrase,
} from '../actions';
import {
  TOGGLE_FILTER_BAR,
  SET_CATEGORY_PAGE,
  UPDATE_CATEGORY_APPLIED_FILTER,
  UPDATE_CATEGORY_APPLIED_FILTERS,
  UPDATE_CATEGORY_COLLAPSE_KEY,
  SET_CATEGORY_FILTERS,
  SET_SEARCH_PHRASE,
} from '../constants';
import { Modules } from '../types';

describe('Actions', () => {
  test('Generate toggle filter bar action', () => {
    expect(toggleFilterBar()).toEqual({ type: TOGGLE_FILTER_BAR });
  });

  test('Generate set category page action', () => {
    expect(setCategoryPage(Modules.WELLS)).toEqual({
      type: SET_CATEGORY_PAGE,
      payload: 'wells',
    });
  });

  test('Generate update category filters action for documents', () => {
    expect(
      updateCategoryAppliedFilter({
        category: 'documents',
        facet: 'fileCategory',
        value: ['option1', 'option2'],
      })
    ).toEqual({
      type: UPDATE_CATEGORY_APPLIED_FILTER,
      payload: {
        category: 'documents',
        facet: 'fileCategory',
        value: ['option1', 'option2'],
      },
    });
  });

  test('Generate update category filters action for wells/seismic', () => {
    expect(
      updateCategoryAppliedFilter({
        category: 'wells',
        facet: 0,
        value: ['option1', 'option2'],
      })
    ).toEqual({
      type: UPDATE_CATEGORY_APPLIED_FILTER,
      payload: {
        category: 'wells',
        facet: 0,
        value: ['option1', 'option2'],
      },
    });
  });

  test('Generate update category collapse key action', () => {
    expect(
      updateCategoryCollapseKey({ category: Modules.WELLS, value: ['0', '1'] })
    ).toEqual({
      type: UPDATE_CATEGORY_COLLAPSE_KEY,
      payload: { category: 'wells', value: ['0', '1'] },
    });
  });

  test('Update docuemnt category applied filters action', () => {
    const documentFilter = getMockDocumentFilter();
    expect(
      updateCategoryAppliedFilters({
        category: Modules.DOCUMENTS,
        value: documentFilter,
      })
    ).toEqual({
      type: UPDATE_CATEGORY_APPLIED_FILTERS,
      payload: {
        category: Modules.DOCUMENTS,
        value: documentFilter,
      },
    });
  });

  test('Update wells category applied filters action', () => {
    expect(
      updateCategoryAppliedFilters({
        category: Modules.WELLS,
        value: { 0: 'check1' },
      })
    ).toEqual({
      type: UPDATE_CATEGORY_APPLIED_FILTERS,
      payload: {
        category: 'wells',
        value: { 0: 'check1' },
      },
    });
  });

  test('Generate set category filter action', () => {
    const appliedFilter = getMockAppliedFiltersType();
    expect(setCategoryFilter(appliedFilter)).toEqual({
      type: SET_CATEGORY_FILTERS,
      payload: appliedFilter,
    });
  });
  test('Generate set search phrase action', () => {
    const phrase = 'Well A';
    expect(setSearchPhrase(phrase)).toEqual({
      type: SET_SEARCH_PHRASE,
      payload: phrase,
    });
  });
});
