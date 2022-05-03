import { renderHook } from '@testing-library/react-hooks';
import { AppStore } from 'core';

import { getMockCasings } from '__test-utils/fixtures/casing';
import {
  mockedWellsFixture,
  mockedWellStateWithSelectedWells,
} from '__test-utils/fixtures/well';
import { testWrapper } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { METER, FEET } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellInspectSelectedWells } from 'modules/wellInspect/hooks/useWellInspect';
import { useSelectedWellboresCasingsQuery } from 'modules/wellSearch/hooks/useSelectedWellboresCasingsQuery';

import { useCasingsForTable, useSelectedWellboresCasingsData } from '../casing';

jest.mock('modules/wellSearch/hooks/useSelectedWellboresCasingsQuery', () => ({
  useSelectedWellboresCasingsQuery: jest.fn(),
}));

jest.mock('hooks/useUserPreferences', () => ({
  useUserPreferencesMeasurement: jest.fn(),
}));

jest.mock('modules/wellInspect/hooks/useWellInspect', () => ({
  useWellInspectSelectedWells: jest.fn(),
}));

describe('casing selectors (useSelectedWellboresCasingsData)', () => {
  beforeEach(() => {
    (useWellInspectSelectedWells as jest.Mock).mockImplementation(
      () => mockedWellsFixture
    );
  });

  const renderHookWithStore = async (store: AppStore) => {
    const { result, waitForNextUpdate } = renderHook(
      () => useSelectedWellboresCasingsData(),
      {
        wrapper: ({ children }) => testWrapper({ store, children }),
      }
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return loading status on data loading', async () => {
    (useSelectedWellboresCasingsQuery as jest.Mock).mockImplementation(() => ({
      isLoading: true,
      data: {},
    }));

    const store = getMockedStore();
    const view = await renderHookWithStore(store);

    expect(view).toEqual({ casings: [], isLoading: true });
  });

  it('should return formatted casings', async () => {
    const wellboreId = 759155409324993;
    const casings = getMockCasings(wellboreId);
    (useSelectedWellboresCasingsQuery as jest.Mock).mockImplementation(() => ({
      isLoading: false,
      data: {
        [wellboreId]: casings,
      },
    }));
    const store = getMockedStore(mockedWellStateWithSelectedWells);
    const view = await renderHookWithStore(store);
    expect(view).toEqual({
      casings: [
        {
          bottomMD: 15191.0089240178,
          casingNames: 'Intermediate 2',
          casings,
          id: wellboreId,
          idMin: 0,
          idUnit: 'in',
          mdUnit: 'ft',
          odMax: 11.875,
          odMin: 11.875,
          odUnit: 'in',
          topMD: 4294.00892401785,
          wellName: '16/1',
          wellboreName: 'wellbore A',
          rkbLevel: undefined,
          rkbLevelUnit: undefined,
          waterDepth: 23.523,
          waterDepthUnit: 'ft',
        },
      ],
      isLoading: false,
    });
  });
});

describe('casing selectors (useCasingsForTable)', () => {
  beforeEach(() => {
    (useWellInspectSelectedWells as jest.Mock).mockImplementation(
      () => mockedWellsFixture
    );
  });

  const renderHookWithStore = async (store: AppStore) => {
    const { result, waitForNextUpdate } = renderHook(
      () => useCasingsForTable(),
      {
        wrapper: ({ children }) => testWrapper({ store, children }),
      }
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return loading status on data loading', async () => {
    (useSelectedWellboresCasingsQuery as jest.Mock).mockImplementation(() => ({
      isLoading: true,
      data: {},
    }));
    (useUserPreferencesMeasurement as jest.Mock).mockImplementation(() => ({
      data: FEET,
    }));
    const store = getMockedStore();
    const view = await renderHookWithStore(store);
    expect(view).toEqual({ casings: [], isLoading: true });
  });

  it('should return formatted casings with unit converted to ft', async () => {
    const wellboreId = 759155409324993;
    const casings = getMockCasings(wellboreId);
    (useSelectedWellboresCasingsQuery as jest.Mock).mockImplementation(() => ({
      isLoading: false,
      data: {
        [wellboreId]: casings,
      },
    }));

    (useUserPreferencesMeasurement as jest.Mock).mockImplementation(() => ({
      data: FEET,
    }));

    const store = getMockedStore(mockedWellStateWithSelectedWells);
    const view = await renderHookWithStore(store);

    expect(view).toEqual({
      casings: [
        {
          bottomMD: '15191.01',
          casingNames: 'Intermediate 2',
          casings,
          id: wellboreId,
          idMin: '0.00',
          idUnit: 'in',
          mdUnit: 'ft',
          odMax: '11.88',
          odMin: '11.88',
          odUnit: 'in',
          topMD: '4294.01',
          wellName: '16/1',
          wellboreName: 'wellbore A',
          rkbLevel: undefined,
          rkbLevelUnit: undefined,
          waterDepth: 23.523,
          waterDepthUnit: 'ft',
        },
      ],
      isLoading: false,
    });
  });

  it('should return formatted casings with unit converted to m', async () => {
    const wellboreId = 759155409324993;
    const casings = getMockCasings(wellboreId);
    (useSelectedWellboresCasingsQuery as jest.Mock).mockImplementation(() => ({
      isLoading: false,
      data: {
        [wellboreId]: casings,
      },
    }));

    (useUserPreferencesMeasurement as jest.Mock).mockImplementation(() => ({
      data: METER,
    }));

    const store = getMockedStore(mockedWellStateWithSelectedWells);
    const view = await renderHookWithStore(store);

    expect(view).toEqual({
      casings: [
        {
          bottomMD: '4630.22',
          casingNames: 'Intermediate 2',
          casings,
          id: wellboreId,
          idMin: '0.00',
          idUnit: 'in',
          mdUnit: 'ft',
          odMax: '11.88',
          odMin: '11.88',
          odUnit: 'in',
          topMD: '1308.81',
          wellName: '16/1',
          wellboreName: 'wellbore A',
          rkbLevel: undefined,
          rkbLevelUnit: undefined,
          waterDepth: 7.169810170566074,
          waterDepthUnit: 'ft',
        },
      ],
      isLoading: false,
    });
  });
});
