import { screen, fireEvent, waitFor } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';
import { initialState } from 'modules/wellSearch/reducer';
import { useFavoriteWellResults, useWells } from 'modules/wellSearch/selectors';

import { FavoriteWellsBulkActions, Props } from '../FavoriteWellsBulkActions';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

jest.mock('modules/wellSearch/selectors/asset/well.ts', () => ({
  useFavoriteWellResults: jest.fn(),
  useWells: jest.fn(),
}));

jest.mock('modules/api/favorites/useFavoritesQuery', () => ({
  useFavoriteUpdateContent: () => ({
    mutateAsync: () => 'Update favorite',
  }),
}));

describe('Favorite Bulk action bar', () => {
  const defaultTestInit = (viewProps?: Props) =>
    testRendererModal(FavoriteWellsBulkActions, undefined, viewProps);

  afterEach(async () => jest.clearAllMocks());

  it('should render the number of wells and wellbores selected', async () => {
    (useFavoriteWellResults as jest.Mock).mockImplementation(() => ({
      data: [],
    }));
    (useWells as jest.Mock).mockImplementation(() => ({
      ...initialState,
    }));

    await defaultTestInit({
      allWellIds: [1, 2],
      selectedWellIdsList: { 1: true },
      deselectAll: jest.fn(),
      favoriteId: '1',
      favoriteWells: {},
      handleUpdatingFavoriteWellState: jest.fn(),
      selectedWellboresList: { '1': ['test 1', 'test 2'] },
    });

    expect(screen.queryByText('1 well selected')).toBeInTheDocument();
    expect(screen.queryByText('With 2 wellbores inside')).toBeInTheDocument();
  });

  it('should deselect all on close', async () => {
    (useFavoriteWellResults as jest.Mock).mockImplementation(() => ({
      data: [],
    }));
    (useWells as jest.Mock).mockImplementation(() => ({
      ...initialState,
    }));

    const deselectAll = jest.fn();

    await defaultTestInit({
      allWellIds: [1, 2],
      selectedWellIdsList: { 1: true },
      deselectAll,
      favoriteId: '1',
      favoriteWells: {},
      handleUpdatingFavoriteWellState: jest.fn(),
      selectedWellboresList: { '1': ['test 1', 'test 2'] },
    });

    const closeBtn = screen.queryByTestId('close-btn');
    if (closeBtn) {
      fireEvent.click(closeBtn);
    }

    expect(deselectAll).toBeCalledTimes(1);
  });

  it('should remove item from favorite set', async () => {
    (useFavoriteWellResults as jest.Mock).mockImplementation(() => ({
      data: [],
    }));
    (useWells as jest.Mock).mockImplementation(() => ({
      ...initialState,
    }));

    const deselectAll = jest.fn();

    await defaultTestInit({
      allWellIds: [1, 2],
      selectedWellIdsList: { 1: true },
      deselectAll,
      favoriteId: '1',
      favoriteWells: { '1': ['test 1'] },
      handleUpdatingFavoriteWellState: jest.fn(),
      selectedWellboresList: { '1': ['test 1', 'test 2'] },
    });

    await fireEvent.click(screen.getByText('Remove from set'));
    fireEvent.click(screen.getByText('Remove'));

    expect(deselectAll).toBeCalledTimes(1);
  });

  it('should call related functions when click `View` button', async () => {
    (useFavoriteWellResults as jest.Mock).mockImplementation(() => ({
      data: [{ id: '1' }],
    }));
    (useWells as jest.Mock).mockImplementation(() => ({
      ...initialState,
    }));

    const handleUpdatingFavoriteWellState = jest.fn();

    await defaultTestInit({
      allWellIds: [1, 2],
      selectedWellIdsList: { 1: true },
      deselectAll: jest.fn(),
      favoriteId: '1',
      favoriteWells: { '1': ['test 1'] },
      handleUpdatingFavoriteWellState,
      selectedWellboresList: { '1': ['test 1', 'test 2'] },
    });
    fireEvent.click(screen.getByText('View'));
    await waitFor(() =>
      expect(handleUpdatingFavoriteWellState).toBeCalledTimes(1)
    );
  });
});
