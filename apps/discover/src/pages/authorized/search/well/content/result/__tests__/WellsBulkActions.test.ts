import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockFavoritesList } from 'services/favorites/__mocks/getMockFavoritesList';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockUserMe } from 'services/userManagementService/__mocks/mockUmsMe';
import { getMockWellsList } from 'services/well/__mocks/getMockWellsList';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { WellsBulkActions } from '../WellsBulkActions';

const mockServer = setupServer(
  getMockFavoritesList(),
  getMockUserMe(),
  getMockConfigGet(),
  getMockWellsList()
);

describe('WellsBulkActions', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const defaultTestInit = async () => {
    const store = getMockedStore();
    return testRenderer(WellsBulkActions, store);
  };

  it('should render `WellsBulkActions` as expected', async () => {
    await defaultTestInit();
    expect(screen.getByTestId('table-bulk-actions')).toBeInTheDocument();
  });
});
