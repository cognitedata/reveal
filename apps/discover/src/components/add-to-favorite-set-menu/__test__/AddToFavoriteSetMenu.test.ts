import { screen } from '@testing-library/react';

import { getMockFavoritesList } from '__test-utils/fixtures/favorite';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { useFavoritesSortedByName } from '../../../modules/api/favorites/useFavoritesQuery';
import { AddToFavoriteSetMenu, Props } from '../AddToFavoriteSetMenu';
import { useHandleSelectFavourite } from '../useFavorite';

const mockFavorites = getMockFavoritesList(2);

jest.mock('modules/api/favorites/useFavoritesQuery.ts', () => ({
  useFavoritesSortedByName: jest.fn(),
  useFavoriteUpdateContent: () => ({
    mutateAsync: () => Promise.resolve(true),
  }),
}));

jest.mock('../useFavorite', () => ({
  useHandleSelectFavourite: jest.fn(() => ({
    handleFavoriteUpdate: jest.fn(),
  })),
}));
describe('Add to favorite set', () => {
  const store = getMockedStore();

  const defaultTestInit = async (viewProps: Props) =>
    testRenderer(AddToFavoriteSetMenu, store, viewProps);

  const handleFavoriteUpdate = jest.fn();
  beforeEach(() => {
    (useHandleSelectFavourite as jest.Mock).mockImplementation(() => ({
      handleFavoriteUpdate,
    }));
  });

  test('should render correct number of favorites', async () => {
    (useFavoritesSortedByName as jest.Mock).mockReturnValue({
      data: mockFavorites,
    });

    await defaultTestInit({});

    // correct number of favorites in list
    const favoriteItems = screen.getAllByText('Mock favorite');
    expect(favoriteItems).toHaveLength(mockFavorites.length);

    // should have "Create new Set" button
    expect(screen.getByText('Create new set')).toBeInTheDocument();
  });

  test('should mark item favored based on selected documents or wells', async () => {
    (useFavoritesSortedByName as jest.Mock).mockReturnValue({
      data: mockFavorites.map((favorite) => {
        if (favorite.id === mockFavorites[0].id) {
          return {
            ...favorite,
            content: {
              ...favorite.content,
              documentIds: [1],
            },
          };
        }
        return {
          ...favorite,
          content: {
            ...favorite.content,
            wells: { 1: [] },
          },
        };
      }),
    });
    await defaultTestInit({ documentIds: [1], wells: { 1: [] } });
    const favorites = screen.getAllByRole('button', {
      name: 'Mock favorite',
    });

    expect(favorites[0]).toBeDisabled();
    expect(favorites[1]).toBeDisabled();
  });

  test('should mark menu item as disabled when clicked (to be marked as favorite) and trigger update function', async () => {
    (useFavoritesSortedByName as jest.Mock).mockReturnValue({
      data: mockFavorites,
    });

    await defaultTestInit({});

    const favorites = screen.getAllByRole('button', {
      name: 'Mock favorite',
    });

    favorites[1].click();
    expect(favorites[1]).toBeDisabled();
    expect(handleFavoriteUpdate).toHaveBeenCalledTimes(1);

    // should not trigger on second click, it is disabled
    favorites[1].click();
    expect(handleFavoriteUpdate).toHaveBeenCalledTimes(1);
  });

  test('should trigger action to open modal when "Create new set" is clicked', async () => {
    (useFavoritesSortedByName as jest.Mock).mockReturnValue({
      data: mockFavorites,
    });

    const expectedActions = [
      {
        type: 'favorites/setItemsToAddOnFavoriteCreation',
        payload: { documentIds: [4, 5], wells: undefined },
      },
      { type: 'favorites/showCreateFavoriteModal', payload: undefined },
    ];

    await defaultTestInit({ documentIds: [4, 5] });
    const createButton = screen.getByText('Create new set');
    createButton.click();
    expect(store.getActions()).toEqual(expectedActions);
  });
});
