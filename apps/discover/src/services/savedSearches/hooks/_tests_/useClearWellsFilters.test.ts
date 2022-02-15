import { renderHook } from '@testing-library/react-hooks';
import { useMutatePatchSavedSearch } from 'services/savedSearches/useSavedSearchQuery';

import {
  useClearWellsFilters,
  useSetWellsFilters,
  useSetWellsFiltersAsync,
} from '../useClearWellsFilters';

jest.mock('services/savedSearches/useSavedSearchQuery', () => ({
  useMutatePatchSavedSearch: jest.fn(),
}));

describe('useClearWellsFilters hook', () => {
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useClearWellsFilters()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should call useClearWellsFilters with empty filter options', async () => {
    const mutate = jest.fn();
    (useMutatePatchSavedSearch as jest.Mock).mockImplementation(() => ({
      mutate,
    }));
    const clearWellsFilters = await getHookResult();

    clearWellsFilters();
    expect(mutate).toHaveBeenCalledWith({ filters: { wells: {} } });
  });
});

describe('useSetWellsFilters hook', () => {
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSetWellsFilters()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should call useSetWellsFilters with filter option', async () => {
    const mutate = jest.fn();
    (useMutatePatchSavedSearch as jest.Mock).mockImplementation(() => ({
      mutate,
    }));
    const setWellsFilters = await getHookResult();

    const filters = { 1: 'Test Filter' };

    setWellsFilters(filters);
    expect(mutate).toHaveBeenCalledWith({ filters: { wells: filters } });
  });
});

describe('useSetWellsFiltersAsync hook', () => {
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSetWellsFiltersAsync()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should call useSetWellsFiltersAsync with filter option', async () => {
    const mutateAsync = jest.fn();
    (useMutatePatchSavedSearch as jest.Mock).mockImplementation(() => ({
      mutateAsync,
    }));
    const setWellsFiltersAsync = await getHookResult();

    const filters = { 1: 'Test Filter' };

    setWellsFiltersAsync(filters);
    expect(mutateAsync).toHaveBeenCalledWith({ filters: { wells: filters } });
  });
});
