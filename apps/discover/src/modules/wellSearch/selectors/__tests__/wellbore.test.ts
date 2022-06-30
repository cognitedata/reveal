import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellbores';
import { useWellInspectSelectedWells } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWells';

import { act } from '@testing-library/react';

import {
  mockedWellsFixture,
  mockedWellsFixtureWellbores,
  mockedWellStateWithSelectedWells,
} from '__test-utils/fixtures/well';
import { renderHookWithStore } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { useWellboreData } from '../wellbore';

jest.mock(
  'domain/wells/well/internal/transformers/useWellInspectSelectedWells',
  () => ({
    useWellInspectSelectedWells: jest.fn(),
  })
);
jest.mock(
  'domain/wells/well/internal/transformers/useWellInspectSelectedWellbores',
  () => ({
    useWellInspectSelectedWellbores: jest.fn(),
  })
);

const mockStore = getMockedStore(mockedWellStateWithSelectedWells);

describe('Wellbore hook', () => {
  beforeEach(() => {
    (useWellInspectSelectedWells as jest.Mock).mockImplementation(
      () => mockedWellsFixture
    );
    (useWellInspectSelectedWellbores as jest.Mock).mockImplementation(
      () => mockedWellsFixtureWellbores
    );
  });

  test('useWellboreData', async () => {
    const { result, waitForNextUpdate, rerender } = renderHookWithStore(
      () => useWellboreData(),
      mockStore
    );

    rerender();

    act(() => {
      waitForNextUpdate();
    });

    expect(result.current).toEqual(
      mockedWellStateWithSelectedWells.wellSearch.wellboreData
    );
  });
});
