import { screen } from '@testing-library/react';

import { mockNptEvents } from '__test-utils/fixtures/npt';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { NptEventsTable } from '../NptEventsTable';

describe('NptEventsTable', () => {
  const defaultTestInit = () => {
    const store = getMockedStore();
    return {
      ...testRenderer(NptEventsTable, store, { events: mockNptEvents }),
    };
  };

  it('should render table as expected', () => {
    defaultTestInit();
    expect(screen.getByTestId('npt-events-table')).toBeInTheDocument();
  });
});
