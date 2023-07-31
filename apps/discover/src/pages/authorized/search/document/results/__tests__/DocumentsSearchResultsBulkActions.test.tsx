import '__mocks/mockContainerAuth'; // should be first
import { getMockFavoritesListGet } from 'domain/favorites/service/__mocks/getMockFavoritesListGet';
import { getMockConfigGet } from 'domain/projectConfig/service/__mocks/getMockConfigGet';

import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { DocumentsSearchResultsBulkActions } from '../DocumentsSearchResultsBulkActions';

const mockServer = setupServer(getMockConfigGet(), getMockFavoritesListGet());

describe('DocumentsSearchResultsBulkActions', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const defaultTestInit = async () => {
    const store = getMockedStore();
    return testRenderer(DocumentsSearchResultsBulkActions, store, {
      selectedDocumentIds: [],
    });
  };

  it('should render `DocumentsSearchResultsBulkActions` as expected', async () => {
    await defaultTestInit();
    expect(screen.getByTestId('table-bulk-actions')).toBeInTheDocument();
  });
});
