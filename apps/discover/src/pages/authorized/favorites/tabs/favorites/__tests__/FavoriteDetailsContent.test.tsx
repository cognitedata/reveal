import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockDocumentCategoriesGet } from 'services/documents/__mocks/getMockDocumentCategoriesGet';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockUserGet } from 'services/user/__mocks/getMockUserGet';
import { getMockUserMe } from 'services/userManagementService/__mocks/mockUmsMe';
import { getMockWellsById } from 'services/well/__mocks/getMockWellsById';

import { getMockFavoriteSummary } from '__test-utils/fixtures/favorite';
import { getMockWell } from '__test-utils/fixtures/well/well';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { defaultTestUser } from '__test-utils/testdata.utils';
import { LOADING_TEXT } from 'components/emptyState/constants';
import navigation from 'constants/navigation';
import { getMockDocumentSearch } from 'modules/documentSearch/__mocks/getMockDocumentSearch';
import {
  FAVORITE_SET_NO_DOCUMENTS,
  FAVORITE_SET_NO_WELLS,
} from 'pages/authorized/favorites/constants';
import {
  FavoriteDetailsContent,
  Props,
} from 'pages/authorized/favorites/tabs/favorites/detailsPage/FavoriteDetailsContent';

const mockServer = setupServer(
  getMockWellsById(),
  getMockConfigGet(),
  getMockDocumentCategoriesGet(),
  getMockUserMe(),
  getMockUserGet(),
  getMockDocumentSearch()
);

describe('Favorite Details Content', () => {
  const mockFavorite = getMockFavoriteSummary();

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const page = (props?: Partial<Props>) => {
    const store = getMockedStore();

    return testRenderer(FavoriteDetailsContent, store, {
      content: mockFavorite.content,
      favoriteId: mockFavorite.id,
      ownerId: defaultTestUser,
      ...props,
    });
  };

  // set location url correctly so child elements get rendered
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.pushState(
      {},
      'Test page',
      navigation.FAVORITE_TAB_DOCUMENTS(mockFavorite.id)
    );
  });

  it('should render loading state', async () => {
    page();

    const wellTab = screen.getByRole('tab', { name: /Wells/ });

    // loading state
    expect(screen.getByText(LOADING_TEXT)).toBeVisible();
    fireEvent.click(wellTab);

    await waitFor(() =>
      expect(screen.queryAllByText(LOADING_TEXT).length).toBe(2)
    );
  });

  it('should render empty state correctly', async () => {
    page();

    const documentsTab = screen.getByRole('tab', { name: /Documents/ });
    const wellTab = screen.getByRole('tab', { name: /Wells/ });

    expect(await within(documentsTab).findByText('0')).toBeInTheDocument();
    expect(await within(wellTab).findByText('0')).toBeInTheDocument();

    expect(screen.getByText(LOADING_TEXT)).not.toBeVisible();
    expect(screen.getByText(FAVORITE_SET_NO_DOCUMENTS)).toBeVisible();
    wellTab.click();
    expect(await screen.findByText(FAVORITE_SET_NO_WELLS)).toBeVisible();
  });

  it('should render component correctly with data', async () => {
    page({
      content: {
        documentIds: [123],
        seismicIds: [],
        wells: { 'test-well-1': [] },
      },
    });

    const wellTab = screen.getByRole('tab', { name: /Wells/ });
    wellTab.click();

    // there are lots of hooks firing, so it's safer to use this instead of findBy
    await waitFor(() => {
      expect(screen.getByText(getMockWell().name)).toBeInTheDocument();
    });

    // check if delete modal dialog and action are called

    fireEvent.mouseOver(screen.getByTestId('table-row'));
    expect(screen.getByTestId('menu-button')).toBeInTheDocument();

    // hover not found:
    // userEvent.hover(screen.getByTestId('menu-button'));
    // expect(screen.getByTestId('remove-from-set')).toBeInTheDocument();

    // Modal is not initializing properly. Maybe need to think about moving to higherlevel
    // https://github.com/reactjs/react-modal/issues/133

    // getByTestId('remove-from-set').click();
    // getByText('Remove').click();
    // expect(mockFavoriteUpdate).toHaveBeenCalled();
  });

  it('should render "Load More" button', async () => {
    page({
      content: { ...mockFavorite.content, documentIds: [123, 2] },
    });

    await screen.findByRole('button', { name: 'Load more' });

    const loadMoreButton = screen.getByRole('button', { name: 'Load more' });
    expect(loadMoreButton).toBeInTheDocument();
    fireEvent.click(loadMoreButton);
  });
});
