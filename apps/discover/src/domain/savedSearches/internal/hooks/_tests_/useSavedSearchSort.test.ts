import { usePatchSavedSearchMutate } from 'domain/savedSearches/internal/actions/usePatchSavedSearchMutate';

import { renderHook } from '@testing-library/react-hooks';

import {
  useSavedSearchSort,
  useSavedSearchSortClear,
} from '../useSavedSearchSort';

jest.mock(
  'domain/savedSearches/internal/actions/usePatchSavedSearchMutate',
  () => ({
    usePatchSavedSearchMutate: jest.fn(),
  })
);

describe('useSavedSearchSort hook', () => {
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSavedSearchSort()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should call useSavedSearchSort with sort by option', async () => {
    const mutate = jest.fn();
    (usePatchSavedSearchMutate as jest.Mock).mockImplementation(() => ({
      mutate,
    }));
    const savedSearchSort = await getHookResult();

    const sortBy = { documents: [{ id: 'id', desc: true }] };

    savedSearchSort(sortBy);
    expect(mutate).toHaveBeenCalledWith({ sortBy });
  });
});

describe('useSavedSearchSortClear hook', () => {
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSavedSearchSortClear()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should call useSavedSearchSortClear with empty sort option', async () => {
    const mutate = jest.fn();
    (usePatchSavedSearchMutate as jest.Mock).mockImplementation(() => ({
      mutate,
    }));
    const savedSearchSortClear = await getHookResult();

    const sortBy = { documents: [] };

    savedSearchSortClear();
    expect(mutate).toHaveBeenCalledWith({ sortBy });
  });
});
