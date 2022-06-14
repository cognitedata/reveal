import '__mocks/mockContainerAuth';
import '__mocks/mockCogniteSDK';
import { getMockFavoritesListGet } from 'domain/favorites/service/__mocks/getMockFavoritesListGet';
import { getMockConfigGet } from 'domain/projectConfig/service/__mocks/getMockConfigGet';
import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';
import { getMockWellsList } from 'domain/wells/well/service/__mocks/getMockWellsList';

import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';

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
