import { useSelector } from 'react-redux';

import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { mockedWellStateWithSelectedWells } from '__test-utils/fixtures/well';

import {
  useActiveWellsWellboresIds,
  useSecondarySelectedOrHoveredWells,
  useSelectedSecondaryWellAndWellboreIds,
  useSelectedWellIds,
} from '../asset/well';

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

describe('Well hook', () => {
  beforeEach(() => {
    (useSelector as jest.Mock).mockImplementation((callback) => {
      return callback(mockedWellStateWithSelectedWells);
    });
  });
  afterEach(() => {
    (useSelector as jest.Mock).mockClear();
  });

  test('load selected well ids', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSelectedWellIds()
    );
    act(() => {
      waitForNextUpdate();
    });
    const data: number[] = result.current;

    expect(data).toEqual([1234]);
  });

  test('load secondary selected well and wellbore ids', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSelectedSecondaryWellAndWellboreIds()
    );
    act(() => {
      waitForNextUpdate();
    });
    const data = result.current;

    expect(data).toEqual({
      selectedSecondaryWellIds: { '1234': true },
      selectedSecondaryWellboreIds: { '75915540932499340': true },
    });
  });

  test('load secondary selected well and wellbore', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSecondarySelectedOrHoveredWells()
    );
    act(() => {
      waitForNextUpdate();
    });
    const data = result.current;

    expect(data[0].id).toEqual(1234);
  });

  test('load active well and wellbore ids', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useActiveWellsWellboresIds()
    );
    act(() => {
      waitForNextUpdate();
    });
    const data = result.current;

    expect(data).toEqual({
      wellIds: [1234],
      wellboreIds: [75915540932499340],
    });
  });
});
