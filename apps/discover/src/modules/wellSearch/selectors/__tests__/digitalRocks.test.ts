import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellboreIds';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellbores';
import { useWellInspectSelectedWells } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWells';

import { renderHook } from '@testing-library/react-hooks';
import { AppStore } from 'core';

import { getMockDigitalRockAsset } from '__test-utils/fixtures/digitalRocks';
import {
  mockedWellsFixture,
  mockedWellsFixtureWellbores,
  mockedWellsFixtureWellIds,
  mockedWellStateWithSelectedWells,
} from '__test-utils/fixtures/well';
import { testWrapper } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import {
  useDigitalRocksSamples,
  useSelectedWellBoresDigitalRocks,
} from '../digitalRocks';

jest.mock(
  'domain/wells/well/internal/hooks/useWellInspectSelectedWellboreIds',
  () => ({
    useWellInspectSelectedWellboreIds: jest.fn(),
  })
);
jest.mock(
  'domain/wells/well/internal/hooks/useWellInspectSelectedWells',
  () => ({
    useWellInspectSelectedWells: jest.fn(),
  })
);
jest.mock(
  'domain/wells/well/internal/hooks/useWellInspectSelectedWellbores',
  () => ({
    useWellInspectSelectedWellbores: jest.fn(),
  })
);
jest.mock(
  'domain/wells/well/internal/hooks/useWellInspectWellboreExternalAssetIdMap',
  () => ({
    useWellInspectWellboreExternalAssetIdMap: () => ({
      parentExternalId: 7591554,
    }),
  })
);

describe('useSelectedWellBoresDigitalRocks', () => {
  beforeEach(() => {
    (useWellInspectSelectedWells as jest.Mock).mockImplementation(
      () => mockedWellsFixture
    );
    (useWellInspectSelectedWellbores as jest.Mock).mockImplementation(
      () => mockedWellsFixtureWellbores
    );
    (useWellInspectSelectedWellboreIds as jest.Mock).mockImplementation(
      () => mockedWellsFixtureWellIds
    );
  });

  const renderHookWithStore = async (store: AppStore) => {
    const { result, waitForNextUpdate } = renderHook(
      () => useSelectedWellBoresDigitalRocks(),
      {
        wrapper: ({ children }: { children: React.ReactNode }) =>
          testWrapper({ store, children }),
      }
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return loading status on data loading', async () => {
    const store = getMockedStore(mockedWellStateWithSelectedWells);
    const view = await renderHookWithStore(store);

    expect(view).toEqual({ isLoading: true, digitalRocks: [] });
  });
});

describe('useDigitalRocksSamples', () => {
  const renderHookWithStore = async (store: AppStore) => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useDigitalRocksSamples([
          getMockDigitalRockAsset({
            id: 1123123,
            parentId: 7591554,
            parentExternalId: 'parentExternalId',
          }),
        ]),
      {
        wrapper: ({ children }: { children: React.ReactNode }) =>
          testWrapper({ store, children }),
      }
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return loading status on data loading', async () => {
    const store = getMockedStore(mockedWellStateWithSelectedWells);
    const view = await renderHookWithStore(store);

    expect(view).toEqual({ isLoading: false, digitalRockSamples: [] });
  });
});
