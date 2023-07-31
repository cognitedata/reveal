import { useFavoritesQuery } from 'domain/favorites/internal/queries/useFavoritesQuery';
import { getMockFavoriteSummary } from 'domain/favorites/service/__fixtures/favorite';

import { renderHook } from '@testing-library/react-hooks';

import { FavoriteSummary } from 'modules/favorite/types';

import { useFavoriteWellIds } from '../useFavoriteWellIds';

jest.mock('domain/favorites/internal/queries/useFavoritesQuery', () => ({
  useFavoritesQuery: jest.fn(),
}));

describe('useFavoriteWellIds hook', () => {
  const getFavoriteWellIds = () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useFavoriteWellIds()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return empty array when no favorite sets data', () => {
    (useFavoritesQuery as jest.Mock).mockImplementation(() => ({
      data: undefined,
    }));

    const favoriteWellIds = getFavoriteWellIds();
    expect(favoriteWellIds).toEqual({});
  });

  it('should return favorite well ids as expected', () => {
    const mockedFavoriteData: FavoriteSummary[] = [
      getMockFavoriteSummary(),
      getMockFavoriteSummary({
        content: {
          documentIds: [],
          seismicIds: [],
          wells: {
            'test-well-id-1': [],
            'test-well-id-2': [],
          },
        },
      }),
      getMockFavoriteSummary({
        content: {
          documentIds: [],
          seismicIds: [],
          wells: {
            'test-well-id-2': [],
            'test-well-id-3': [],
          },
        },
      }),
    ];

    (useFavoritesQuery as jest.Mock).mockImplementation(() => ({
      data: mockedFavoriteData,
    }));

    const favoriteWellIds = getFavoriteWellIds();
    expect(favoriteWellIds).toEqual({
      'test-well-id-1': [],
      'test-well-id-2': [],
      'test-well-id-3': [],
    });
  });
});
