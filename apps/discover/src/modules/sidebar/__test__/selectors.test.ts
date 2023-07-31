import { useSelector } from 'react-redux';

import { renderHook } from '@testing-library/react-hooks';

import {
  getMockSidebarState,
  getMockActiveKeys,
  getMockAppliedFiltersType,
  getMockDocumentFilter,
  getMockWellFilter,
  DEFAULT_SEARCH_PHRASE,
  DEFAULT_OPEN_CATEGORY,
} from '__test-utils/fixtures/sidebar';

import {
  useSidebar,
  useFilterCategory,
  useFilterBarIsOpen,
  useFilterActiveKeys,
  useFilterAppliedFilters,
  useAppliedDocumentFilters,
  useAppliedWellFilters,
  useSearchPhrase,
} from '../selectors';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

const appState = {
  sidebar: getMockSidebarState(),
};

describe('Sie bar Selectors', () => {
  beforeEach(() => {
    (useSelector as jest.Mock).mockImplementation((callback) => {
      return callback(appState);
    });
  });

  it(`Should return sidebar state`, () => {
    expect(useSidebar()).toEqual(appState.sidebar);
  });

  it('Should return side bar open status', () => {
    const { result } = renderHook(() => useFilterBarIsOpen(), {});
    expect(result.current).toEqual(true);
  });

  it('Should currently open category', () => {
    const { result } = renderHook(() => useFilterCategory(), {});
    expect(result.current).toEqual(DEFAULT_OPEN_CATEGORY);
  });

  it('Should currently active keys', () => {
    const { result } = renderHook(() => useFilterActiveKeys(), {});
    expect(result.current).toEqual(getMockActiveKeys());
  });

  it('Should return applied filters', () => {
    const { result } = renderHook(() => useFilterAppliedFilters(), {});
    expect(result.current).toEqual(getMockAppliedFiltersType());
  });

  it('Should return applied document filters', () => {
    const { result } = renderHook(() => useAppliedDocumentFilters(), {});
    expect(result.current).toEqual(getMockDocumentFilter());
  });

  it('Should return applied well filters', () => {
    const { result } = renderHook(() => useAppliedWellFilters(), {});
    expect(result.current).toEqual(getMockWellFilter());
  });

  it('Should return search phrase', () => {
    const { result } = renderHook(() => useSearchPhrase(), {});
    expect(result.current).toEqual(DEFAULT_SEARCH_PHRASE);
  });
});
