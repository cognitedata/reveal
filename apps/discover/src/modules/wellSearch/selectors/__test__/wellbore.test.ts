import { useSelector } from 'react-redux';

import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { mockedWellStateWithSelectedWells } from '__test-utils/fixtures/well';
import { Wellbore, WellboreAssetIdMap } from 'modules/wellSearch/types';

import {
  useActiveWellboresExternalIdMap,
  useActiveWellboresMatchingIdMap,
  useActiveWellboresSourceExternalIdMap,
  useSecondarySelectedOrHoveredWellbores,
  useSelectedOrHoveredWellbores,
  useSelectedWellbores,
  useWellboreAssetIdMap,
} from '../asset/wellbore';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('react-query', () => ({
  useQueryClient: () => ({
    setQueryData: jest.fn(),
  }),
  useQuery: () => ({ isLoading: false, error: {}, data: [] }),
}));

describe('Wellbore hook', () => {
  beforeEach(() => {
    (useSelector as jest.Mock).mockImplementation((callback) => {
      return callback(mockedWellStateWithSelectedWells);
    });
  });
  afterEach(() => {
    (useSelector as jest.Mock).mockClear();
  });

  test('load selected wellbore data', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSelectedWellbores()
    );
    act(() => {
      waitForNextUpdate();
    });
    const data: Wellbore[] = result.current;

    expect(data[0].name).toEqual('wellbore A');
    expect(data.length).toEqual(1);
  });

  test('load wellbore asset ids', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useWellboreAssetIdMap()
    );
    act(() => {
      waitForNextUpdate();
    });
    const data: WellboreAssetIdMap = result.current;

    expect(data[75915540932488340]).toEqual(75915540932488340);
  });

  test('load selected or hovered wellbores', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSelectedOrHoveredWellbores()
    );
    act(() => {
      waitForNextUpdate();
    });
    const data: Wellbore[] = result.current;

    expect(data[0].name).toEqual('wellbore A');
    expect(data.length).toEqual(1);
  });

  test('load selected or hovered wellbores external id map', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useActiveWellboresExternalIdMap()
    );
    act(() => {
      waitForNextUpdate();
    });

    expect(result.current).toEqual({
      'Wellbore A:75915540932499340': 75915540932499340,
    });
  });

  test('load secondary selected or hovered wellbores', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSecondarySelectedOrHoveredWellbores()
    );
    act(() => {
      waitForNextUpdate();
    });
    const data: Wellbore[] = result.current;

    expect(data[0].name).toEqual('wellbore A');
    expect(data.length).toEqual(1);
  });

  test('load selected or hovered wellbores matching id map', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useActiveWellboresMatchingIdMap()
    );
    act(() => {
      waitForNextUpdate();
    });

    expect(result.current).toEqual({
      'Wellbore A:75915540932499340': 75915540932499340,
    });
  });

  test('load selected or hovered wellbores source external id map', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useActiveWellboresSourceExternalIdMap()
    );
    act(() => {
      waitForNextUpdate();
    });

    expect(result.current).toEqual({
      'Wellbore A:75915540932499340': 75915540932499340,
    });
  });
});
