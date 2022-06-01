import { useWellSearchResultQuery } from 'domain/wells/well/internal/queries/useWellSearchResultQuery';

import { renderHook } from '@testing-library/react-hooks';

import {
  mockedWellsFixture,
  mockedWellsFixtureWellbores,
  mockedWellsFixtureWellIds,
} from '__test-utils/fixtures/well';
import { WellId } from 'modules/wellSearch/types';

import {
  useWellQueryResultWellbores,
  useWellQueryResultWellIds,
  useWellQueryResultWells,
} from '../useWellQueryResultSelectors';

jest.mock(
  'domain/wells/well/internal/queries/useWellSearchResultQuery',
  () => ({
    useWellSearchResultQuery: jest.fn(),
  })
);

describe('useWellQueryResultSelectors', () => {
  beforeEach(() => {
    (useWellSearchResultQuery as jest.Mock).mockImplementation(() => ({
      data: { wells: mockedWellsFixture },
    }));
  });

  describe('useWellQueryResultWells', () => {
    const getHookResult = () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useWellQueryResultWells()
      );
      waitForNextUpdate();
      return result.current;
    };

    it('should return empty array when wells data is undefined', () => {
      (useWellSearchResultQuery as jest.Mock).mockImplementation(() => ({
        data: undefined,
      }));

      const wells = getHookResult();
      expect(wells).toEqual([]);
    });

    it('should return wells as expected', () => {
      const wells = getHookResult();
      expect(wells).toEqual(mockedWellsFixture);
    });
  });

  describe('useWellQueryResultWellbores', () => {
    const getHookResult = (wellIds: WellId[]) => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useWellQueryResultWellbores(wellIds)
      );
      waitForNextUpdate();
      return result.current;
    };

    it('should return wellbores as expected', () => {
      const wellbores = getHookResult(['1234']);
      expect(wellbores).toEqual(mockedWellsFixtureWellbores);
    });
  });

  describe('useWellQueryResultWellIds', () => {
    const getHookResult = () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useWellQueryResultWellIds()
      );
      waitForNextUpdate();
      return result.current;
    };

    it('should return well ids as expected', () => {
      const wellIds = getHookResult();
      expect(wellIds).toEqual(mockedWellsFixtureWellIds.map(String));
    });
  });
});
