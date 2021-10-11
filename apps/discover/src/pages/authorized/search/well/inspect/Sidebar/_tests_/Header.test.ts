import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useActiveWellsWellboresCount } from 'modules/wellSearch/selectors';

import { Header } from '../Header';

jest.mock('modules/wellSearch/selectors', () => ({
  useActiveWellsWellboresCount: jest.fn(),
}));

describe('Well Inspect Sidebar Header', () => {
  const page = (viewStore: Store) => testRenderer(Header, viewStore);

  const defaultTestInit = async () => {
    const store = getMockedStore();
    return { ...page(store), store };
  };

  it(`should display single counts`, async () => {
    (useActiveWellsWellboresCount as jest.Mock).mockImplementation(() => ({
      wells: 1,
      wellbores: 1,
    }));
    await defaultTestInit();
    const wellCountText = await screen.findByText('1 well');
    expect(wellCountText).toBeInTheDocument();

    const wellboreCountText = await screen.findByText('1 wellbore');
    expect(wellboreCountText).toBeInTheDocument();
  });

  it(`should display multiple counts`, async () => {
    (useActiveWellsWellboresCount as jest.Mock).mockImplementation(() => ({
      wells: 2,
      wellbores: 2,
    }));
    await defaultTestInit();
    const wellCountText = await screen.findByText('2 wells');
    expect(wellCountText).toBeInTheDocument();

    const wellboreCountText = await screen.findByText('2 wellbores');
    expect(wellboreCountText).toBeInTheDocument();
  });
});
