import { fireEvent, screen } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';
import { LOADING_TEXT } from 'components/emptyState/constants';
import { initialState } from 'modules/wellSearch/reducer';
import { useFavoriteWellResults, useWells } from 'modules/wellSearch/selectors';
import {
  FAVORITE_SET_NO_WELLS,
  REMOVE_FROM_SET_TEXT,
} from 'pages/authorized/favorites/constants';

import { FavoriteWellsTable, Props } from '../FavoriteWellTable';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

jest.mock('modules/wellSearch/selectors/asset/well.ts', () => ({
  useFavoriteWellResults: jest.fn(),
  useWells: jest.fn(),
}));

describe('Favorite Wellbore table', () => {
  const defaultTestInit = (viewProps?: Props) =>
    testRendererModal(FavoriteWellsTable, undefined, viewProps);

  afterEach(async () => jest.clearAllMocks());

  it('should render table correctly', async () => {
    (useFavoriteWellResults as jest.Mock).mockImplementation(() => ({
      data: [
        {
          matchingId: '308f0eb7-f40c-4df6-bc6e-303b8c9f97f0',
          name: 'Test well',
          description: 'Well F-1',
          field: 'SLEIPNER',
          operator: 'Statoil Norway',
          id: '12',
        },
      ],
      isLoading: false,
    }));
    (useWells as jest.Mock).mockImplementation(() => ({
      ...initialState,
    }));
    await defaultTestInit({
      wells: {},
      removeWell: jest.fn(),
      favoriteId: '1',
    });
    expect(screen.getByText('Test well')).toBeInTheDocument();
    expect(screen.getByText('Statoil Norway')).toBeInTheDocument();
    expect(screen.getByText('SLEIPNER')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByTestId('menu-button')).toBeInTheDocument();
  });

  it('should render the no well message', async () => {
    (useFavoriteWellResults as jest.Mock).mockImplementation(() => ({
      data: [],
      isLoading: false,
    }));
    (useWells as jest.Mock).mockImplementation(() => ({
      ...initialState,
    }));

    await defaultTestInit({
      wells: {},
      removeWell: jest.fn(),
      favoriteId: '1',
    });

    expect(screen.queryByText(FAVORITE_SET_NO_WELLS)).toBeInTheDocument();
  });

  it('should render loading message when `isLoading` is true and no data', async () => {
    (useFavoriteWellResults as jest.Mock).mockImplementation(() => ({
      data: [{}],
      isLoading: true,
    }));
    (useWells as jest.Mock).mockImplementation(() => ({
      ...initialState,
    }));
    await defaultTestInit({
      wells: {},
      removeWell: jest.fn(),
      favoriteId: '1',
    });
    expect(screen.getAllByText(LOADING_TEXT).length).toEqual(2);
  });

  it('should render remove button when hover the more option button', async () => {
    (useFavoriteWellResults as jest.Mock).mockImplementation(() => ({
      data: [
        {
          matchingId: '308f0eb7-f40c-4df6-bc6e-303b8c9f97f0',
          name: 'Test well',
          description: 'Well F-1',
          field: 'SLEIPNER',
          operator: 'Statoil Norway',
          id: '12',
        },
      ],
      isLoading: false,
    }));
    (useWells as jest.Mock).mockImplementation(() => ({
      ...initialState,
    }));
    await defaultTestInit({
      wells: {},
      removeWell: jest.fn(),
      favoriteId: '1',
    });

    fireEvent.mouseEnter(screen.getByTestId('menu-button'), {
      bubbles: true,
    });
    expect(screen.getByText(REMOVE_FROM_SET_TEXT)).toBeInTheDocument();
  });
});
