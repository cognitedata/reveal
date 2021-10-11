import { screen } from '@testing-library/react';

import { mockNptEvents } from '__test-utils/fixtures/npt';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { NptWellboresTable } from '../NptWellboresTable';

describe('NptWellboresTable', () => {
  const defaultTestInit = () => {
    const store = getMockedStore();
    return {
      ...testRenderer(NptWellboresTable, store, { events: mockNptEvents }),
    };
  };

  it('should render table as expected', () => {
    defaultTestInit();
    expect(screen.getByTestId('npt-table-wellbores')).toBeInTheDocument();
  });
});
