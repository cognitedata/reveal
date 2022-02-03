import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { Content } from '../Content';

jest.mock('modules/wellInspect/hooks/useWellInspect', () => ({
  useWellInspectWells: () => [
    {
      id: '0',
      name: 'WellA',
      wellbores: [
        {
          id: '1',
          name: 'WellboreA',
          description: 'WellboreDescription',
        },
      ],
    },
  ],
}));

describe('Well Inspect Sidebar Content', () => {
  const page = (viewStore: Store) => testRenderer(Content, viewStore);

  const defaultTestInit = async () => {
    const store = getMockedStore();
    return { ...page(store), store };
  };

  it(`should display wells and wellbore names`, async () => {
    await defaultTestInit();
    const well = await screen.findByText('WellA');
    expect(well).toBeInTheDocument();

    const wellbore = await screen.findByTitle('WellboreDescription WellboreA');
    expect(wellbore).toBeInTheDocument();
  });
});
