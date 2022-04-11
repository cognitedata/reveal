import { screen } from '@testing-library/react';

import { mockNptEvents } from '__test-utils/fixtures/npt';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useNptEvents } from 'modules/wellSearch/selectors';

import { NptWellsTable } from '../NptWellsTable';

jest.mock('modules/wellSearch/selectors', () => ({
  useNptEvents: jest.fn(),
}));

jest.mock('modules/inspectTabs/selectors', () => ({
  useFilterDataNpt: () => ({
    duration: [0, 10],
    nptCode: ['CODE_A, CODE_B'],
    nptDetailCode: ['DETAIL_A', 'DETAIL_B'],
  }),
}));

describe('NptWellsTable', () => {
  beforeEach(() => {
    (useNptEvents as jest.Mock).mockImplementation(() => ({
      isLoading: false,
      events: mockNptEvents,
    }));
  });

  const defaultTestInit = () => {
    const store = getMockedStore();
    return {
      ...testRenderer(NptWellsTable, store, { events: [{ wellboreIds: 1 }] }),
    };
  };

  it('should render table as expected', () => {
    defaultTestInit();
    expect(screen.getByTestId('npt-table-wells')).toBeInTheDocument();
  });
});
