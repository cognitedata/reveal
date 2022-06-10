import {
  useSearchHasAnyAppliedFilters,
  isAnyFilterApplied,
} from 'domain/savedSearches/internal/queries/useSearchHasAnyAppliedFilters';

import { renderHook } from '@testing-library/react-hooks';

import { QueryClientWrapper } from '__test-utils/queryClientWrapper';

// this one throws an "open handle" console error. It will help to investigate later
describe('useSearchHasAnyAppliedFilters hook', () => {
  it('should return false initially', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useSearchHasAnyAppliedFilters(),
      { wrapper: QueryClientWrapper }
    );
    await waitForNextUpdate();
    expect(result.current).toBeFalsy();
  });
});

describe('isAnyFilterApplied hook', () => {
  it('should return false for given properties', () => {
    expect(isAnyFilterApplied()).toBeFalsy();
    expect(isAnyFilterApplied([])).toBeFalsy();
    expect(isAnyFilterApplied([[]])).toBeFalsy();
    expect(isAnyFilterApplied({})).toBeFalsy();
    expect(isAnyFilterApplied([{}])).toBeFalsy();
    expect(isAnyFilterApplied([12345])).toBeFalsy();
    expect(isAnyFilterApplied({ test: [{ test: [] }] })).toBeFalsy();
  });

  it('should return true for give properties', () => {
    expect(isAnyFilterApplied([[12345]])).toBeTruthy();
    expect(isAnyFilterApplied({ test: 'test' })).toBeTruthy();
    expect(isAnyFilterApplied({ test: true })).toBeTruthy();
    expect(isAnyFilterApplied({ test: 2 })).toBeTruthy();
    expect(isAnyFilterApplied({ test: ['yes'] })).toBeTruthy();
    expect(isAnyFilterApplied({ test: { test: 'yes' } })).toBeTruthy();
    expect(isAnyFilterApplied({ test: { test: ['yes'] } })).toBeTruthy();
    expect(isAnyFilterApplied(['yes'])).toBeTruthy();
  });
});
