import { useQueryClient } from 'react-query';

import { renderHook } from '@testing-library/react-hooks';

import { getMockWell } from '__test-utils/fixtures/well';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { Well } from 'modules/wellSearch/types';

import { useAddToWellsCache } from '../useAddToWellsCache';

jest.mock('react-query', () => ({
  useQueryClient: jest.fn(),
}));

describe('useAddToWellsCache', () => {
  const setQueryData = jest.fn();

  const mockQueryClientWithData = (wells: Well[]) => {
    (useQueryClient as jest.Mock).mockImplementation(() => ({
      setQueryData,
      getQueryData: () => wells,
    }));
  };

  const getHookResult = () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAddToWellsCache()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should cache all wells when wells cache is empty', () => {
    const wells = [getMockWell({ id: 'well1' }), getMockWell({ id: 'well2' })];

    mockQueryClientWithData([]);
    const addToWellsCache = getHookResult();

    addToWellsCache(wells);
    expect(setQueryData).toHaveBeenLastCalledWith(
      WELL_QUERY_KEY.WELLS_CACHE,
      wells
    );
  });

  it('should add only the uncached wells to the cache', () => {
    const cachedWell1 = getMockWell({ id: 'cachedWell1' });
    const cachedWell2 = getMockWell({ id: 'cachedWell2' });
    const uncachedWell1 = getMockWell({ id: 'uncachedWell1' });
    const uncachedWell2 = getMockWell({ id: 'uncachedWell2' });

    mockQueryClientWithData([cachedWell1, cachedWell2]);
    const addToWellsCache = getHookResult();

    addToWellsCache([cachedWell1, uncachedWell1, uncachedWell2]);
    expect(setQueryData).toHaveBeenLastCalledWith(WELL_QUERY_KEY.WELLS_CACHE, [
      cachedWell1,
      cachedWell2,
      uncachedWell1,
      uncachedWell2,
    ]);
  });
});
