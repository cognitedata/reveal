import { useDispatch } from 'react-redux';

import { renderHook } from '@testing-library/react-hooks';

import { getMockWellFilter } from '__test-utils/fixtures/sidebar';

import { useWellsSearch } from '../useWellsSearch';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

describe('useWellsSearch hook', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    (useDispatch as jest.Mock).mockImplementation(() => dispatch);
  });

  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() => useWellsSearch());
    waitForNextUpdate();
    return result.current;
  };

  it('should not call dispatch when search query is empty', async () => {
    const doWellsSearch = await getHookResult();

    doWellsSearch({});
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should call dispatch as expected', async () => {
    const doWellsSearch = await getHookResult();

    doWellsSearch({ filters: { wells: getMockWellFilter() } });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
