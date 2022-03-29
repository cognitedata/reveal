import '__mocks/mockContainerAuth'; // should be first
import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockFavoritesListGet } from 'services/favorites/__mocks/getMockFavoritesListGet';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { DocumentsBulkActions } from '../DocumentsBulkActions';

const mockServer = setupServer(getMockConfigGet(), getMockFavoritesListGet());

describe('DocumentsBulkActions', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const defaultTestInit = async () => {
    const store = getMockedStore();
    return testRenderer(DocumentsBulkActions, store, {
      selectedDocumentIds: [],
    });
  };

  it('should render `DocumentsBulkActions` as expected', async () => {
    await defaultTestInit();
    expect(screen.getByTestId('table-bulk-actions')).toBeInTheDocument();
  });
});
