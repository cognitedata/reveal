import {
  mockedWellsFixture,
  mockedWellStateWithSelectedWells,
} from '__test-utils/fixtures/well';
import { renderHookWithStore } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useWellQueryResultWells } from 'modules/wellSearch/hooks/useWellQueryResultSelectors';

import { useSelectedWellIds, useIndeterminateWells } from '../well';

jest.mock('modules/wellSearch/hooks/useWellQueryResultSelectors', () => ({
  useWellQueryResultWells: jest.fn(),
}));

const mockedStore = getMockedStore(mockedWellStateWithSelectedWells);

describe('Well hook', () => {
  test('load selected well ids', () => {
    const { result } = renderHookWithStore(
      () => useSelectedWellIds(),
      mockedStore
    );

    const data: string[] = result.current;

    expect(data).toEqual(['1234']);
  });

  test('useIndeterminateWells', () => {
    (useWellQueryResultWells as jest.Mock).mockImplementation(
      () => mockedWellsFixture
    );

    const { result } = renderHookWithStore(
      () => useIndeterminateWells(),
      mockedStore
    );

    expect(result.current).toEqual({ '1234': true });
  });
});
