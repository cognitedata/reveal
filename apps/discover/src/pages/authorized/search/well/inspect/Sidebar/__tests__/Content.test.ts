import '__mocks/mockCogniteSDK';

import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { SidebarContent } from '../SidebarContent';

jest.mock('domain/wells/well/internal/hooks/useWellInspectWells', () => ({
  useWellInspectWells: () => ({
    wells: [
      {
        id: '0',
        name: 'WellA',
        wellbores: [
          {
            id: '1',
            name: 'WellboreA',
            description: 'WellboreDescription',
            title: 'WellboreDescription WellboreA',
          },
        ],
      },
      {
        id: '1',
        name: 'WellB',
        wellbores: [
          {
            id: '2',
            name: '',
            description: 'WellboreDescriptionB',
            title: 'WellboreDescription WellboreB',
          },
        ],
      },
    ],
  }),
}));

describe('Well Inspect Sidebar Content', () => {
  const page = (viewStore: Store) => testRenderer(SidebarContent, viewStore);

  const defaultTestInit = async () => {
    const store = getMockedStore();
    return { ...page(store), store };
  };

  it(`should display wells and wellbore names`, async () => {
    await defaultTestInit();
    const well = await screen.findByText('WellA');
    expect(well).toBeInTheDocument();

    expect(screen.getByTitle('WellboreA')).toBeInTheDocument();

    expect(
      screen.getByTitle('WellboreDescription WellboreB')
    ).toBeInTheDocument();
  });
});
