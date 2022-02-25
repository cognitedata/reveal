import { screen } from '@testing-library/react';
import { useUserProfileQuery } from 'services/user/useUserQuery';

import { getMockFavoriteSummary } from '__test-utils/fixtures/favorite';
import { testRenderer } from '__test-utils/renderer';
import { defaultTestUser } from '__test-utils/testdata.utils';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { FavoriteDetailsHeader } from 'pages/authorized/favorites/tabs/favorites/detailsPage/header';
import { Props } from 'pages/authorized/favorites/tabs/favorites/detailsPage/header/FavoriteDetailsHeader';

const mockUser = defaultTestUser;

jest.mock('services/user/useUserQuery.ts', () => ({
  useUserProfileQuery: jest.fn(),
}));

jest.mock('hooks/useProjectConfig.ts', () => ({
  ...jest.requireActual('hooks/useProjectConfig.ts'),
  useProjectConfigByKey: jest.fn(),
}));

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
    (useProjectConfigByKey as jest.Mock).mockImplementation(() => ({
      data: undefined,
    }));

    (useUserProfileQuery as jest.Mock).mockImplementation(() => ({
      data: { id: mockUser },
    }));

    page();

    const title = screen.getByTitle(mockFavorite.name);
    const description = screen.getByText(mockFavorite.description);
    expect(title).toBeInTheDocument();
    expect(description).toBeInTheDocument();

    // should display 4 action buttons since download button is not enabled in Project config
    const buttons = screen.queryAllByTestId('base-button-margin-wrapper');
    expect(buttons).toHaveLength(4);
  });

  it('should show skeletons if status isLoading is true', async () => {
    (useProjectConfigByKey as jest.Mock).mockImplementation(() => ({
      data: undefined,
    }));

    (useUserProfileQuery as jest.Mock).mockImplementation(() => ({
      data: { id: mockUser },
    }));

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
    (useProjectConfigByKey as jest.Mock).mockImplementation(() => ({
      data: {
        showDownloadAllDocumentsButton: true,
      },
    }));

    (useUserProfileQuery as jest.Mock).mockImplementation(() => ({
      data: { id: mockUser },
    }));

    page();

    const buttons = screen.queryAllByTestId('base-button-margin-wrapper');
    expect(buttons).toHaveLength(5);
  });

  it('should display only 3 action buttons if user is not owner', async () => {
    (useProjectConfigByKey as jest.Mock).mockImplementation(() => ({
      data: {
        showDownloadAllDocumentsButton: true,
      },
    }));

    (useUserProfileQuery as jest.Mock).mockImplementation(() => ({
      data: { id: 'something different' },
    }));

    page();

    const buttons = screen.queryAllByTestId('base-button-margin-wrapper');
    expect(buttons).toHaveLength(3);
  });
});
