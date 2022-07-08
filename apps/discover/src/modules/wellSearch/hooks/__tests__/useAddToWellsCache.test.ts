import { WellInternal } from 'domain/wells/well/internal/types';

import { useQueryClient } from 'react-query';

import { renderHook } from '@testing-library/react-hooks';
import concat from 'lodash/concat';

import { getMockWell } from '__test-utils/fixtures/well';
import { WELL_QUERY_KEY } from 'constants/react-query';

import { useAddToWellsCache } from '../useAddToWellsCache';

jest.mock('react-query', () => ({
  useQueryClient: jest.fn(),
}));

describe('useAddToWellsCache', () => {
  const setQueryData = jest.fn();

  const mockQueryClientWithData = (wells: WellInternal[]) => {
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
    const cachedWells = Array.from({ length: 10 }, (_, count) => count + 1).map(
      (id) => getMockWell({ id })
    );

    // This case happens when the filter results return the same wells we had before and some other ones
    const uncachedWells = Array.from(
      { length: 10 },
      (_, count) => count + 1
    ).map((id) => getMockWell({ id }));

    const uncachedWell1 = getMockWell({ id: 'uncachedWell1' });
    const uncachedWell2 = getMockWell({ id: 'uncachedWell2' });
    uncachedWells.push(uncachedWell1);
    uncachedWells.push(uncachedWell2);

    mockQueryClientWithData(cachedWells);
    const addToWellsCache = getHookResult();

    addToWellsCache(uncachedWells);
    expect(setQueryData).toHaveBeenLastCalledWith(
      WELL_QUERY_KEY.WELLS_CACHE,
      concat(cachedWells, [uncachedWell1, uncachedWell2])
    );
  });
});
