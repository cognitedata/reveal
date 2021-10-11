import { screen, fireEvent } from '@testing-library/react';

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

describe('Favorite Bulk action bar', () => {
  const defaultTestInit = (viewProps?: Props) =>
    testRendererModal(FavoriteWellsBulkActions, undefined, viewProps);

  afterEach(async () => jest.clearAllMocks());

  it('should render the number of wells selected', async () => {
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
      handleUpdatingFavoriteWellState: jest.fn(),
    });

    const emptyState = screen.queryByText('1 well selected');

    expect(emptyState).toBeInTheDocument();
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
      handleUpdatingFavoriteWellState: jest.fn(),
    });

    const closeBtn = screen.queryByTestId('close-btn');
    if (closeBtn) {
      fireEvent.click(closeBtn);
    }

    expect(deselectAll).toBeCalledTimes(1);
  });
});
