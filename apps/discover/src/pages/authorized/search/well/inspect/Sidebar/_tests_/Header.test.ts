import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useActiveWellsWellboresCount } from 'modules/wellSearch/selectors';
import { useSecondarySelectedWellsAndWellboresCount } from 'modules/wellSearch/selectors/asset/well';

import { Header } from '../Header';

jest.mock('modules/wellSearch/selectors', () => ({
  useActiveWellsWellboresCount: jest.fn(),
}));

jest.mock('modules/wellSearch/selectors/asset/well', () => ({
  useSecondarySelectedWellsAndWellboresCount: jest.fn(),
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
    (
      useSecondarySelectedWellsAndWellboresCount as jest.Mock
    ).mockImplementation(() => ({
      secondaryWells: 1,
      secondaryWellbores: 1,
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
    (useActiveWellsWellboresCount as jest.Mock).mockImplementation(() => ({
      wells: 2,
      wellbores: 2,
    }));
    (
      useSecondarySelectedWellsAndWellboresCount as jest.Mock
    ).mockImplementation(() => ({
      secondaryWells: 1,
      secondaryWellbores: 1,
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
