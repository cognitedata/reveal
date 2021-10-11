import { useSelector } from 'react-redux';

import { cleanup } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import noop from 'lodash/noop';

import { QueryClientWrapper } from '__test-utils/queryClientWrapper';

import {
  useWells,
  useWellbores,
  useSelectedWellbores,
  useSelectedWellboreIds,
  useWellboreData,
  useSelectedWells,
  useExternalLinkFromSelectedWells,
  useIndeterminateWells,
  useSelectedOrHoveredWells,
  useActiveWellsWellboresCount,
} from '../selectors';
import { InspectWellboreContext } from '../types';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

const mockExternalLink = jest.fn();

jest.mock('hooks/useTenantConfig', () => ({
  useTenantConfig: () => mockExternalLink(),
}));

const wellState = {
  wellSearch: {
    wells: [
      {
        id: 252284653,
        name: 'Well 1',
        wellbores: [
          {
            id: 229987867,
            name: 'Wellbore 1',
          },
          {
            id: 229987868,
            name: 'Wellbore 3',
          },
        ],
        metadata: {
          productionDataLink: true,
          wellDataLink: true,
        },
      },
      {
        id: 234784653,
        name: 'Well 2',
        wellbores: [
          {
            id: 129377867,
            name: 'Wellbore 2',
          },
          {
            id: 129377868,
            name: 'Wellbore 2',
          },
        ],
        metadata: {
          productionDataLink: true,
        },
      },
    ],
    selectedWellIds: { 252284653: true },
    selectedWellboreIds: { 229987867: true },
    hoveredWellId: 234784653,
    hoveredWellboreIds: { 129377868: true },
    inspectWellboreContext: InspectWellboreContext.CHECKED_WELLBORES,
    wellboreData: {
      229987867: { logType: [] },
    },
    filters: {
      '1': ['Test Value'],
    },
  },
};

describe('Well Selectors', () => {
  beforeEach(() => {
    (useSelector as jest.Mock).mockImplementation((callback) => {
      return callback(wellState);
    });
  });

  afterEach(() => {
    (useSelector as jest.Mock).mockClear();
    cleanup();
  });

  it(`should return well search state`, () => {
    expect(useWells()).toEqual(wellState.wellSearch);
  });

  it(`should return wellbores for the given well`, async () => {
    const { result } = renderHook(() => useWellbores([252284653]), {});
    act(() => noop());

    expect(result.current).toEqual({
      isLoading: false,
      wellbores: wellState.wellSearch.wells[0].wellbores,
    });
  });

  it(`should return selected wellbores`, () => {
    const { result } = renderHook(() => useSelectedWellbores(), {});

    const wellbores = result.current;

    expect(wellbores).toEqual([wellState.wellSearch.wells[0].wellbores[0]]);
  });

  it(`should return selected wellbores ids as a list`, () => {
    const { result } = renderHook(() => useSelectedWellboreIds(), {});
    const wellboreIds = result.current;
    expect(wellboreIds).toEqual([
      wellState.wellSearch.wells[0].wellbores.map((wellbore) => wellbore.id)[0],
    ]);
  });

  it(`should return wellbore data`, () => {
    const { result } = renderHook(() => useWellboreData(), {});
    expect(result.current).toEqual(wellState.wellSearch.wellboreData);
  });

  it(`should return selected wells and wellbores`, async () => {
    const { result } = renderHook(() => useSelectedWells(), {});
    const selectedWell = wellState.wellSearch.wells[0];
    const expected = [
      {
        ...selectedWell,
        wellbores: [selectedWell.wellbores[0]],
      },
    ];
    expect(result.current).toEqual(expected);
  });

  it(`should return indeterminate wells (Wells that some of its wellbores are selected)`, async () => {
    const { result } = renderHook(() => useIndeterminateWells(), {});
    expect(result.current).toEqual({
      [wellState.wellSearch.wells[0].id]: true,
    });
  });

  it(`should return selected or hovered wells for checked context`, async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useSelectedOrHoveredWells(),
      { wrapper: QueryClientWrapper }
    );
    await act(() => waitForNextUpdate());
    expect(result.current[0].id).toEqual(252284653);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should return empty array based on selected wells metadata and tenantConfig', async () => {
    mockExternalLink.mockImplementation(() => ({
      test: (items: string) => `test ${items}`,
    }));
    const { result } = renderHook(() => useExternalLinkFromSelectedWells());
    act(() => noop());

    expect(result.current).toEqual([]);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should return correct link based on selected wells metadata and tenantConfig', async () => {
    mockExternalLink.mockImplementation(() => ({
      productionDataLink: (items: string) => `This is some link ${items}`,
    }));
    const { result } = renderHook(() => useExternalLinkFromSelectedWells());
    act(() => noop());

    expect(result.current).toEqual(['This is some link Well 1']);
  });
  // disabled for now until the well data comes
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should return correct links based on selected wells metadata and tenantConfig', () => {
    (useSelector as jest.Mock).mockImplementation((callback) => {
      return callback({
        ...wellState,
        wellSearch: {
          ...wellState.wellSearch,
          selectedWellIds: { 252284653: true, 234784653: true },
        },
      });
    });

    mockExternalLink.mockImplementation(() => ({
      productionDataLink: (items: string) => `This is some link ${items}`,
      wellDataLink: (items: string) => `This is another link ${items}`,
    }));
    const { result } = renderHook(() => useExternalLinkFromSelectedWells());
    act(() => noop());

    expect(result.current).toEqual([
      'This is some link Well 1,Well 2',
      'This is another link Well 1',
    ]);
  });

  describe('Well Selectors inspect context hovered', () => {
    beforeEach(() => {
      (useSelector as jest.Mock).mockImplementation((callback) => {
        return callback({
          wellSearch: {
            ...wellState.wellSearch,
            inspectWellboreContext: InspectWellboreContext.HOVERED_WELLBORES,
          },
        });
      });
    });

    it(`should return selected or hovered wells for hovered context`, async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useSelectedOrHoveredWells(),
        { wrapper: QueryClientWrapper }
      );
      await act(() => waitForNextUpdate());
      expect(result.current[0].id).toEqual(234784653);
    });

    it(`should return selected or hovered wells and wellbores count`, async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useActiveWellsWellboresCount(),
        { wrapper: QueryClientWrapper }
      );
      await act(() => waitForNextUpdate());
      expect(result.current).toEqual({ wells: 1, wellbores: 1 });
    });
  });
});
