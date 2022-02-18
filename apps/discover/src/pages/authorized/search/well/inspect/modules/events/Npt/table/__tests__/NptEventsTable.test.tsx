import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockUserMe } from 'services/userManagementService/__mocks/mockUmsMe';

import { mockNptEvents } from '__test-utils/fixtures/npt';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { NptEventsTable } from '../NptEventsTable';

const mockServer = setupServer(getMockUserMe());

describe('NptEventsTable', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

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
