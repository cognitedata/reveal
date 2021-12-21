import { act } from '@testing-library/react';

import { mockedWellStateWithSelectedWells } from '__test-utils/fixtures/well';
import { renderHookWithStore } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { Wellbore, WellboreAssetIdMap } from 'modules/wellSearch/types';

import {
  useActiveWellboresExternalIdMap,
  useActiveWellboresMatchingIdMap,
  useActiveWellboresSourceExternalIdMap,
  useSecondarySelectedOrHoveredWellbores,
  useSelectedOrHoveredWellbores,
  useSelectedWellbores,
  useWellboreAssetIdMap,
  useWellboreData,
} from '../asset/wellbore';

const mockStore = getMockedStore(mockedWellStateWithSelectedWells);

describe('Wellbore hook', () => {
  test('load selected wellbore data', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useSelectedWellbores(),
      mockStore
    );
    act(() => {
      waitForNextUpdate();
    });
    const data: Wellbore[] = result.current;

    expect(data[0].name).toEqual('wellbore A');
    expect(data.length).toEqual(1);
  });

  test('load wellbore asset ids', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useWellboreAssetIdMap(),
      mockStore
    );
    act(() => {
      waitForNextUpdate();
    });
    const data: WellboreAssetIdMap = result.current;

    expect(data[759155409324993]).toEqual(759155409324993);
  });

  test('load selected or hovered wellbores', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useSelectedOrHoveredWellbores(),
      mockStore
    );
    act(() => {
      waitForNextUpdate();
    });
    const data: Wellbore[] = result.current;

    expect(data[0].name).toEqual('wellbore A');
    expect(data.length).toEqual(1);
  });

  test('load selected or hovered wellbores external id map', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useActiveWellboresExternalIdMap(),
      mockStore
    );
    act(() => {
      waitForNextUpdate();
    });

    expect(result.current).toEqual({
      'Wellbore A:759155409324993': 759155409324993,
    });
  });

  test('load secondary selected or hovered wellbores', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useSecondarySelectedOrHoveredWellbores(),
      mockStore
    );
    act(() => {
      waitForNextUpdate();
    });
    const data: Wellbore[] = result.current;

    expect(data[0].name).toEqual('wellbore A');
    expect(data.length).toEqual(1);
  });

  test('load selected or hovered wellbores matching id map', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useActiveWellboresMatchingIdMap(),
      mockStore
    );
    act(() => {
      waitForNextUpdate();
    });

    expect(result.current).toEqual({
      'Wellbore A:759155409324993': 759155409324993,
    });
  });

  test('load selected or hovered wellbores source external id map', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useActiveWellboresSourceExternalIdMap(),
      mockStore
    );
    act(() => {
      waitForNextUpdate();
    });

    expect(result.current).toEqual({
      'Wellbore A:759155409324993': 759155409324993,
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
