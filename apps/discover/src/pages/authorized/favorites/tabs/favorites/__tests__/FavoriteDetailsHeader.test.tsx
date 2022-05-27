import '__mocks/mockContainerAuth'; // should be first
import { getMockFavoriteSummary } from 'domain/favorites/service/__fixtures/favorite';
import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';

import { screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';

import { testRenderer } from '__test-utils/renderer';
import { defaultTestUser } from '__test-utils/testdata.utils';
import { FavoriteDetailsHeader } from 'pages/authorized/favorites/tabs/favorites/detailsPage/header';
import { Props } from 'pages/authorized/favorites/tabs/favorites/detailsPage/header/FavoriteDetailsHeader';

describe('Favorite Details Header', () => {
  const mockFavorite = getMockFavoriteSummary();
  const page = (props?: Partial<Props>) =>
    testRenderer(FavoriteDetailsHeader, undefined, {
      favorite: mockFavorite,
      isLoading: false,
      handleDownloadAllDocuments: jest.fn(),
      handleToggleEditModal: jest.fn(),
      handleToggleShareModal: jest.fn(),
      ...props,
    });

  it('should render component', async () => {
    const mockServer = setupServer(
      getMockUserMe({ id: defaultTestUser }),
      getMockConfigGet()
    );
    mockServer.listen();

    await page();

    const title = screen.getByTitle(mockFavorite.name);
    const description = screen.getByText(mockFavorite.description);
    expect(title).toBeInTheDocument();
    expect(description).toBeInTheDocument();

    // should display 4 action buttons since download button is not enabled in Project config

    await waitFor(() => {
      const buttons = screen.queryAllByTestId('base-button-margin-wrapper');
      expect(buttons).toHaveLength(4);
    });

    mockServer.close();
  });

  it('should show skeletons if status isLoading is true', async () => {
    const mockServer = setupServer(
      getMockUserMe({ id: defaultTestUser }),
      getMockConfigGet()
    );
    mockServer.listen();

    page({
      isLoading: true,
    });

    // should not display title
    const title = screen.queryByText(mockFavorite.name);
    expect(title).not.toBeInTheDocument();

    // should display 1 action button
    const buttons = screen.queryByTestId('base-button-margin-wrapper');
    expect(buttons).toBeInTheDocument();

    // should have 2 skeletons
    const skeletons = screen.getAllByRole('row');
    expect(skeletons).toHaveLength(2);
  });

  it('should display 5 action buttons if download button is enabled in Project settings', async () => {
    const mockServer = setupServer(
      getMockUserMe({ id: defaultTestUser }),
      getMockConfigGet({ favorites: { showDownloadAllDocumentsButton: true } })
    );
    mockServer.listen();

    page();

    await waitFor(() =>
      expect(
        screen.queryAllByTestId('base-button-margin-wrapper')
      ).toHaveLength(5)
    );
    mockServer.close();
  });

  it('should display only 3 action buttons if user is not owner', async () => {
    const mockServer = setupServer(
      getMockUserMe(),
      getMockConfigGet({ favorites: { showDownloadAllDocumentsButton: true } })
    );
    mockServer.listen();

    page({ favorite: { ...mockFavorite, owner: { id: '1' } } });

    await waitFor(() =>
      expect(
        screen.queryAllByTestId('base-button-margin-wrapper')
      ).toHaveLength(3)
    );

    mockServer.close();
  });
});
