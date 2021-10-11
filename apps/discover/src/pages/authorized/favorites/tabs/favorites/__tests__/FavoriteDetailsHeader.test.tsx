import { screen } from '@testing-library/react';

import { getMockFavoriteSummary } from '__test-utils/fixtures/favorite';
import { testRenderer } from '__test-utils/renderer';
import { defaultTestUser } from '__test-utils/testdata.utils';
import { useTenantConfigByKey } from 'hooks/useTenantConfig';
import { useUserProfileQuery } from 'modules/api/user/useUserQuery';
import { FavoriteDetailsHeader } from 'pages/authorized/favorites/tabs/favorites/detailsPage/header';
import { Props } from 'pages/authorized/favorites/tabs/favorites/detailsPage/header/FavoriteDetailsHeader';

const mockUser = defaultTestUser;

jest.mock('modules/api/user/useUserQuery.ts', () => ({
  useUserProfileQuery: jest.fn(),
}));

jest.mock('hooks/useTenantConfig.ts', () => ({
  ...jest.requireActual('hooks/useTenantConfig.ts'),
  useTenantConfigByKey: jest.fn(),
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
    (useTenantConfigByKey as jest.Mock).mockImplementation(() => ({
      data: undefined,
    }));

    (useUserProfileQuery as jest.Mock).mockImplementation(() => ({
      data: { id: mockUser },
    }));

    page();

    const title = screen.getByText(mockFavorite.name);
    const description = screen.getByText(mockFavorite.description);
    expect(title).toBeInTheDocument();
    expect(description).toBeInTheDocument();

    // should display 3 action buttons since download button is not enabled in tenant config
    const buttons = screen.queryAllByTestId('base-button-margin-wrapper');
    expect(buttons).toHaveLength(3);
  });

  it('should show skeletons if status isLoading is true', async () => {
    (useTenantConfigByKey as jest.Mock).mockImplementation(() => ({
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

  it('should display 4 action buttons if download button is enabled in tenant settings', async () => {
    (useTenantConfigByKey as jest.Mock).mockImplementation(() => ({
      data: {
        showDownloadAllDocumentsButton: true,
      },
    }));

    (useUserProfileQuery as jest.Mock).mockImplementation(() => ({
      data: { id: mockUser },
    }));

    page();

    // should display 4 action buttons
    const buttons = screen.queryAllByTestId('base-button-margin-wrapper');
    expect(buttons).toHaveLength(4);
  });

  it('should display only 2 action buttons if user is not owner', async () => {
    (useTenantConfigByKey as jest.Mock).mockImplementation(() => ({
      data: {
        showDownloadAllDocumentsButton: true,
      },
    }));

    (useUserProfileQuery as jest.Mock).mockImplementation(() => ({
      data: { id: 'something different' },
    }));

    page();

    // should display 4 action buttons
    const buttons = screen.queryAllByTestId('base-button-margin-wrapper');
    expect(buttons).toHaveLength(2);
  });
});
