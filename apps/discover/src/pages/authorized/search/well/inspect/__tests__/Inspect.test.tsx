import { useWellInspectWells } from 'domain/wells/well/internal/transformers/useWellInspect';
import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreIds';

import { screen } from '@testing-library/react';
import { Store } from 'redux';

import {
  mockedWellsFixture,
  mockedWellsFixtureWellboreIds,
} from '__test-utils/fixtures/well';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import navigation from 'constants/navigation';

import { WellInspect } from '../Inspect';

const tabItems = ['Trajectories'];

const mockPush = jest.fn();

jest.mock('modules/wellSearch/hooks/useWellConfig', () => ({
  useWellConfig: () => ({
    data: {
      trajectory: {
        enabled: true,
      },
    },
  }),
}));

jest.mock(
  'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreIds',
  () => ({
    useWellInspectSelectedWellboreIds: jest.fn(),
  })
);
jest.mock('domain/wells/well/internal/transformers/useWellInspect', () => ({
  useWellInspectWells: jest.fn(),
}));

jest.mock('modules/resultPanel/selectors', () => ({
  useActivePanel: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({ push: mockPush }),
}));

describe('Well Inspect', () => {
  beforeEach(() => {
    (useWellInspectWells as jest.Mock).mockImplementation(() => ({
      wells: mockedWellsFixture,
    }));
    (useWellInspectSelectedWellboreIds as jest.Mock).mockImplementation(
      () => mockedWellsFixtureWellboreIds
    );
  });

  const page = (viewStore: Store) => testRenderer(WellInspect, viewStore);

  const defaultTestInit = async () => {
    const store = getMockedStore();
    return { ...page(store), store };
  };

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it(`should render tab %s`, async () => {
    await defaultTestInit();
    const row = await screen.findByText(tabItems[0]);
    expect(row).toBeInTheDocument();
  });
});

describe('Well Inspect fetch errors', () => {
  beforeEach(() => {
    (useWellInspectWells as jest.Mock).mockImplementation(() => ({
      wells: [],
      error: {
        message: 'Error',
      },
    }));
    (useWellInspectSelectedWellboreIds as jest.Mock).mockImplementation(
      () => mockedWellsFixtureWellboreIds
    );
  });

  const page = (viewStore: Store) => testRenderer(WellInspect, viewStore);

  const defaultTestInit = async () => {
    const store = getMockedStore();
    return { ...page(store), store };
  };

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it(`should trigger redirect`, async () => {
    await defaultTestInit();
    expect(mockPush).toHaveBeenCalledWith(navigation.SEARCH);
  });
});
