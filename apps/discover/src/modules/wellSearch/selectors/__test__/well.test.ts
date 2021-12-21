import { act } from '@testing-library/react';
import uniqueId from 'lodash/uniqueId';

import {
  mockedWellStateWithSelectedWells,
  mockedWellResultFixture,
} from '__test-utils/fixtures/well';
import { renderHookWithStore } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import {
  useActiveWellsWellboresIds,
  useSecondarySelectedOrHoveredWells,
  useSelectedSecondaryWellAndWellboreIds,
  useSelectedWellIds,
  useSecondarySelectedWellsAndWellboresCount,
  useSelectedOrHoveredWells,
  useWellResult,
  useGroupedWells,
  useSelectedWells,
  useIndeterminateWells,
} from '../asset/well';

const mockedStore = getMockedStore(mockedWellStateWithSelectedWells);

describe('Well hook', () => {
  test('load selected well ids', () => {
    const { result } = renderHookWithStore(
      () => useSelectedWellIds(),
      mockedStore
    );

    const data: number[] = result.current;

    expect(data).toEqual([1234]);
  });

  test('load secondary selected well and wellbore ids', () => {
    const { result } = renderHookWithStore(
      () => useSelectedSecondaryWellAndWellboreIds(),
      mockedStore
    );

    const data = result.current;

    expect(data).toEqual({
      selectedSecondaryWellIds: { '1234': true },
      selectedSecondaryWellboreIds: { '759155409324993': true },
    });
  });

  test('load secondary selected well and wellbore', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useSecondarySelectedOrHoveredWells(),
      mockedStore
    );

    await act(() => waitForNextUpdate());

    const data = result.current;

    expect(data[0].id).toEqual(1234);
  });

  test('load active well and wellbore ids', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useActiveWellsWellboresIds(),
      mockedStore
    );

    await act(() => waitForNextUpdate());

    const data = result.current;

    expect(data).toEqual({
      wellIds: [1234],
      wellboreIds: [759155409324993],
    });
  });

  test('load secondary well and wellbore count', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useSecondarySelectedWellsAndWellboresCount(),
      mockedStore
    );

    act(() => {
      waitForNextUpdate();
    });

    const data = result.current;

    expect(data).toEqual({
      secondaryWells: 1,
      secondaryWellbores: 1,
    });
  });

  test('useSelectedOrHoveredWells', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useSelectedOrHoveredWells(),
      mockedStore
    );

    await act(() => waitForNextUpdate());

    const data = result.current;

    expect(data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 1234 })])
    );
  });

  test('useWellResult', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useWellResult(1235),
      mockedStore
    );
    await act(() => waitForNextUpdate());

    expect(result.current).toEqual(
      expect.objectContaining({
        id: 1235,
        description: 'A008',
      })
    );
  });

  test('useGroupedWells', () => {
    const externalId = uniqueId('Well_');
    const wellsWithExternalId = mockedWellResultFixture.map((well) => ({
      ...well,
      externalId,
    }));

    const { result } = renderHookWithStore(
      () => useGroupedWells(),
      getMockedStore({
        wellSearch: {
          wells: wellsWithExternalId,
        },
      })
    );

    expect(result.current).toEqual({
      [externalId]: wellsWithExternalId,
    });
  });

  test('useSelectedWells', () => {
    const { result } = renderHookWithStore(
      () => useSelectedWells(),
      mockedStore
    );

    expect(result.current).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1234,
          wellbores: [expect.objectContaining({ id: 759155409324993 })],
        }),
      ])
    );
  });

  test('useIndeterminateWells', () => {
    const { result } = renderHookWithStore(
      () => useIndeterminateWells(),
      mockedStore
    );

    expect(result.current).toEqual({ 1234: true });
  });
});
