import { screen, fireEvent } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';

import { FavoriteWellsBulkActions, Props } from '../FavoriteWellsBulkActions';

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
}));

jest.mock('modules/wellSearch/hooks/useWellsCacheQuerySelectors', () => ({
  useWellsByIds: jest.fn(),
}));

jest.mock('services/favorites/useFavoritesQuery', () => ({
  useFavoriteUpdateContent: () => ({
    mutateAsync: () => 'Update favorite',
  }),
}));

describe('Favorite Bulk action bar', () => {
  afterEach(async () => jest.clearAllMocks());

  const defaultTestInit = (viewProps?: Props) =>
    testRendererModal(FavoriteWellsBulkActions, undefined, viewProps);

  const deselectAll = jest.fn();

  it('should render the number of wells and wellbores selected', async () => {
    await defaultTestInit({
      allWellIds: [1, 2],
      selectedWellIdsList: { 1: true },
      deselectAll: jest.fn(),
      favoriteId: '1',
      favoriteWells: {},
      selectedWellboresList: { '1': ['test 1', 'test 2'] },
    });

    expect(screen.getByText('1 well selected')).toBeInTheDocument();
    expect(screen.getByText('With 2 wellbores inside')).toBeInTheDocument();
  });

  it('should deselect all on close', async () => {
    await defaultTestInit({
      allWellIds: [1, 2],
      selectedWellIdsList: { 1: true },
      deselectAll,
      favoriteId: '1',
      favoriteWells: {},
      selectedWellboresList: { '1': ['test 1', 'test 2'] },
    });

    const closeBtn = screen.queryByTestId('close-btn');
    if (closeBtn) {
      fireEvent.click(closeBtn);
    }

    expect(deselectAll).toBeCalledTimes(1);
  });

  it('should remove item from favorite set', async () => {
    await defaultTestInit({
      allWellIds: [1, 2],
      selectedWellIdsList: { 1: true },
      deselectAll,
      favoriteId: '1',
      favoriteWells: { '1': ['test 1'] },
      selectedWellboresList: { '1': ['test 1', 'test 2'] },
    });

    await fireEvent.click(screen.getByText('Remove from set'));
    fireEvent.click(screen.getByText('Remove'));

    expect(deselectAll).toBeCalledTimes(1);
  });
});
