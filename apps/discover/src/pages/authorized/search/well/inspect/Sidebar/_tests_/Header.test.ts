import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useWellInspectSelectionStats } from 'modules/wellInspect/selectors';

import { Header } from '../Header';

jest.mock('modules/wellSearch/selectors', () => ({
  useActiveWellsWellboresCount: jest.fn(),
}));

jest.mock('modules/wellInspect/selectors', () => ({
  useWellInspectSelectionStats: jest.fn(),
  useWellInspectGoBackNavigationPath: jest.fn(),
}));

describe('Well Inspect Sidebar Header', () => {
  const page = (viewStore: Store) => testRenderer(Header, viewStore);

  const defaultTestInit = async () => {
    const store = getMockedStore();
    return { ...page(store), store };
  };

  it(`should display single counts`, async () => {
    (useWellInspectSelectionStats as jest.Mock).mockImplementation(() => ({
      wellsCount: 1,
      wellboresCount: 1,
      selectedWellsCount: 1,
      selectedWellboresCount: 1,
    }));

    await defaultTestInit();
    const wellCountText = await screen.findByText('1 / 1 well selected');
    expect(wellCountText).toBeInTheDocument();

    const wellboreCountText = await screen.findByText(
      '1 / 1 wellbore selected'
    );
    expect(wellboreCountText).toBeInTheDocument();
  });

  it(`should display multiple counts`, async () => {
    (useWellInspectSelectionStats as jest.Mock).mockImplementation(() => ({
      wellsCount: 2,
      wellboresCount: 2,
      selectedWellsCount: 1,
      selectedWellboresCount: 1,
    }));

    await defaultTestInit();
    const wellCountText = await screen.findByText('1 / 2 wells selected');
    expect(wellCountText).toBeInTheDocument();

    const wellboreCountText = await screen.findByText(
      '1 / 2 wellbores selected'
    );
    expect(wellboreCountText).toBeInTheDocument();
  });
});
