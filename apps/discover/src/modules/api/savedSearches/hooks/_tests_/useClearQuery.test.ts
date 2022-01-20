import { renderHook } from '@testing-library/react-hooks';

import { useMutatePatchSavedSearch } from 'modules/api/savedSearches/useSavedSearchQuery';

import { useClearQuery, useSetQuery } from '../useClearQuery';

jest.mock('modules/api/savedSearches/useSavedSearchQuery', () => ({
  useMutatePatchSavedSearch: jest.fn(),
}));

describe('useClearQuery hook', () => {
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() => useClearQuery());
    waitForNextUpdate();
    return result.current;
  };

  it('should call useClearQuery with empty query', async () => {
    const mutateAsync = jest.fn();
    (useMutatePatchSavedSearch as jest.Mock).mockImplementation(() => ({
      mutateAsync,
    }));
    const clearQuery = await getHookResult();
    clearQuery();
    expect(mutateAsync).toHaveBeenCalledWith({ query: '' });
  });
});

describe('useSetQuery hook', () => {
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSetQuery());
    waitForNextUpdate();
    return result.current;
  };

  it('should call useSetQuery with filter query', async () => {
    const mutateAsync = jest.fn();
    (useMutatePatchSavedSearch as jest.Mock).mockImplementation(() => ({
      mutateAsync,
    }));
    const clearQuery = await getHookResult();
    const query = 'Test Query';
    clearQuery(query);
    expect(mutateAsync).toHaveBeenCalledWith({ query });
  });
});
