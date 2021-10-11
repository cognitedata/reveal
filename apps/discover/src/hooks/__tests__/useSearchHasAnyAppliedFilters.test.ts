import { renderHook } from '@testing-library/react-hooks';

import { QueryClientWrapper } from '__test-utils/queryClientWrapper';
import {
  useSearchHasAnyAppliedFilters,
  isAnyFilterApplied,
} from 'hooks/useSearchHasAnyAppliedFilters';

describe('useSearchHasAnyAppliedFilters hook', () => {
  it('should return false initially', () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useSearchHasAnyAppliedFilters(),
      { wrapper: QueryClientWrapper }
    );
    waitForNextUpdate();
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
