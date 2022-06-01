import {
  useWellInspectWellboreAssetIdMap,
  useWellInspectWellboreExternalIdMap,
  useWellInspectWellboreIdMap,
} from 'domain/wells/well/internal/transformers/useWellInspectIdMap';
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
import { WellboreAssetIdMap } from 'modules/wellSearch/types';

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

  test('load wellbore asset ids', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useWellInspectWellboreAssetIdMap(),
      mockStore
    );
    act(() => {
      waitForNextUpdate();
    });
    const data: WellboreAssetIdMap = result.current;

    expect(data['759155409324993']).toEqual('759155409324993');
  });

  // eslint-disable-next-line jest/no-commented-out-tests
  // test('load selected or hovered wellbores external id map', async () => {
  //   const { result, waitForNextUpdate } = renderHookWithStore(
  //     () => useActiveWellboresExternalIdMap(),
  //     mockStore
  //   );
  //   act(() => {
  //     waitForNextUpdate();
  //   });

  //   expect(result.current).toEqual({
  //     'Wellbore A:759155409324993': 759155409324993,
  //   });
  // });

  test('load selected or hovered wellbores matching id map', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useWellInspectWellboreIdMap(),
      mockStore
    );
    act(() => {
      waitForNextUpdate();
    });

    expect(result.current).toEqual({
      'Wellbore A:759155409324993': '759155409324993',
    });
  });

  test('load selected or hovered wellbores source external id map', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useWellInspectWellboreExternalIdMap(),
      mockStore
    );
    act(() => {
      waitForNextUpdate();
    });

    expect(result.current).toEqual({
      'Wellbore A:759155409324993': '759155409324993',
    });
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
