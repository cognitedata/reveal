import { renderHook } from '@testing-library/react-hooks';
import { AppStore } from 'core';

import { Asset } from '@cognite/sdk';

import { createdAndLastUpdatedTime } from '__test-utils/fixtures/log';
import { mockedWellStateWithSelectedWells } from '__test-utils/fixtures/well';
import { testWrapper } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { useGrainPartionings } from '../grainAnalysis';

const digitalRockSamples: Asset[] = [
  {
    parentId: 1123123,
    metadata: {
      wellboreId: '75915540932499342',
    },
    id: 1,
    name: 'asset 1',
    rootId: 1123123,
    ...createdAndLastUpdatedTime,
  },
  {
    id: 122342,
    parentId: 1123123,
    metadata: {
      wellboreId: '75915540932499343',
    },
    ...createdAndLastUpdatedTime,
    name: 'asset 2',
    rootId: 1123123,
  },
];

describe('useGrainPartionings', () => {
  const renderHookWithStore = async (
    store: AppStore,
    digitalrockSample: Asset
  ) => {
    const { result, waitForNextUpdate } = renderHook(
      () => useGrainPartionings(digitalrockSample),
      {
        wrapper: ({ children }) => testWrapper({ store, children }),
      }
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return loading status on data loading', async () => {
    const store = getMockedStore(mockedWellStateWithSelectedWells);
    const view = await renderHookWithStore(store, digitalRockSamples[0]);

    expect(view).toEqual({ isLoading: true });
  });

  it('should return grain analysis data for given digital rock sample', async () => {
    const store = getMockedStore(mockedWellStateWithSelectedWells);
    const view = await renderHookWithStore(store, digitalRockSamples[1]);

    expect(view).toEqual({
      isLoading: false,
      grainPartionings: [{ id: 32134 }],
    });
  });
});
