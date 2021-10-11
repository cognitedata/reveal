import { renderHook } from '@testing-library/react-hooks';
import { AppStore } from 'core';

import { getMockDigitalRockAsset } from '__test-utils/fixtures/digitalRocks';
import { mockedWellStateWithSelectedWells } from '__test-utils/fixtures/well';
import { testWrapper } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import {
  useDigitalRocksSamples,
  useSelectedWellBoresDigitalRocks,
} from '../asset/digitalRocks';

describe('useSelectedWellBoresDigitalRocks', () => {
  const renderHookWithStore = async (store: AppStore) => {
    const { result, waitForNextUpdate } = renderHook(
      () => useSelectedWellBoresDigitalRocks(),
      {
        wrapper: ({ children }) => testWrapper({ store, children }),
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
          }),
        ]),
      {
        wrapper: ({ children }) => testWrapper({ store, children }),
      }
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return loading status on data loading', async () => {
    const store = getMockedStore(mockedWellStateWithSelectedWells);
    const view = await renderHookWithStore(store);

    expect(view).toEqual({ isLoading: true, digitalRockSamples: [] });
  });
});
