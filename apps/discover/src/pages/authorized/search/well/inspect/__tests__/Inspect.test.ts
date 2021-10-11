import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { WellInspect } from '../Inspect';

const tabItems = ['Trajectories'];

jest.mock('modules/wellSearch/hooks/useWellConfig', () => ({
  useWellConfig: () => ({
    data: {
      trajectory: {
        enabled: true,
      },
    },
  }),
}));

jest.mock('modules/resultPanel/selectors', () => ({
  useActivePanel: jest.fn(),
}));

describe('Well Inspect', () => {
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
