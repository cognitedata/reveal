import 'services/wellSearch/__mocks/setupWellsMockSDK';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockUserMe } from 'services/userManagementService/__mocks/mockUmsMe';
import { getMockWellsById } from 'services/wellSearch/__mocks/getMockWellsById';

import { getMockWell } from '__test-utils/fixtures/well/well';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { LOADING_TEXT } from 'components/EmptyState/constants';
import { initialState } from 'modules/wellSearch/reducer';
import {
  FAVORITE_SET_NO_WELLS,
  REMOVE_FROM_SET_TEXT,
} from 'pages/authorized/favorites/constants';

import { FavoriteWellsTable, Props } from '../FavoriteWellTable';

const mockServer = setupServer(
  getMockUserMe(),
  getMockWellsById(),
  getMockConfigGet()
);

describe('Favorite Wellbore table', () => {
  const defaultTestInit = (
    viewProps?: Props,
    store = getMockedStore({
      wellSearch: {
        ...initialState,
        selectedColumns: initialState.selectedColumns.concat(['fieldname']),
      },
    })
  ) => testRenderer(FavoriteWellsTable, store, viewProps);

  afterEach(async () => jest.clearAllMocks());
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should render table correctly', async () => {
    const well = getMockWell();
    await defaultTestInit({
      wells: {
        'test-well-1': [],
      },
      removeWell: jest.fn(),
      favoriteId: '1',
    });

    expect(screen.getAllByText(LOADING_TEXT).length).toEqual(2);
    // wait for everything to finish loading
    // there are lots of hooks firing, so it's safer to use this instead of findBy
    await waitFor(() => {
      expect(screen.getByText(well.name)).toBeInTheDocument();
    });

    expect(screen.queryAllByText(LOADING_TEXT).length).toEqual(0);
    expect(screen.getByTitle(well.operator || '-error-')).toBeInTheDocument();
    expect(screen.getByText(well.field || '-error-')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByTestId('menu-button')).toBeInTheDocument();
  });

  it('should render the no well message', async () => {
    await defaultTestInit({
      wells: {},
      removeWell: jest.fn(),
      favoriteId: '1',
    });

    expect(await screen.findByText(FAVORITE_SET_NO_WELLS)).toBeInTheDocument();
  });

  it('should render loading message when `isLoading` is true and no data', async () => {
    await defaultTestInit({
      wells: {},
      removeWell: jest.fn(),
      favoriteId: '1',
    });
    expect(await screen.findByText(LOADING_TEXT)).toBeInTheDocument();
    expect(screen.getAllByText(LOADING_TEXT).length).toEqual(1);
  });

  it('should render remove button when hovering over the more options button', async () => {
    const { getByText } = await defaultTestInit({
      wells: {
        'test-well-1': [],
      },
      removeWell: jest.fn(),
      favoriteId: '1',
    });

    // wait for everything to finish loading
    /* eslint-disable*/
    /**
     * The reason we use the waitFor here explicitly is because of the high number of re-rendering
     * causing sporadic unit-test fails. Generally we should use screen.findBy....
     * */
    await waitFor(() =>
      expect(getByText(getMockWell().name)).toBeInTheDocument()
    );

    fireEvent.mouseEnter(screen.getByTestId('menu-button'), {
      bubbles: true,
    });
    expect(screen.getByText(REMOVE_FROM_SET_TEXT)).toBeInTheDocument();
  });
});
