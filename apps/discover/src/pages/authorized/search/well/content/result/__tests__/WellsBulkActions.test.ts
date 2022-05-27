import '__mocks/mockContainerAuth';
import '__mocks/mockCogniteSDK';
import { getMockFavoritesListGet } from 'domain/favorites/service/__mocks/getMockFavoritesListGet';
import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';

import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockWellsList } from 'services/wellSearch/__mocks/getMockWellsList';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { WellsBulkActions } from '../WellsBulkActions';

const mockServer = setupServer(
  getMockFavoritesListGet(),
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
