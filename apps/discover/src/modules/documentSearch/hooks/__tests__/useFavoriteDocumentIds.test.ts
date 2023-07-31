import { useFavoritesQuery } from 'domain/favorites/internal/queries/useFavoritesQuery';
import { getMockFavoriteSummary } from 'domain/favorites/service/__fixtures/favorite';

import { renderHook } from '@testing-library/react-hooks';

import { FavoriteSummary } from 'modules/favorite/types';

import { useFavoriteDocumentIds } from '../useFavoriteDocumentIds';

jest.mock('domain/favorites/internal/queries/useFavoritesQuery', () => ({
  useFavoritesQuery: jest.fn(),
}));

describe('useFavoriteDocumentIds hook', () => {
  const getFavoriteDocumentIds = () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useFavoriteDocumentIds()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return empty array when no favorite sets data', () => {
    (useFavoritesQuery as jest.Mock).mockImplementation(() => ({
      data: undefined,
    }));

    const favoriteDocumentIds = getFavoriteDocumentIds();
    expect(favoriteDocumentIds).toEqual([]);
  });

  it('should return favorite document ids as expected', () => {
    const mockedFavoriteData: FavoriteSummary[] = [
      getMockFavoriteSummary(),
      getMockFavoriteSummary({
        content: {
          documentIds: [1234, 5678],
          seismicIds: [],
          wells: {},
        },
      }),
      getMockFavoriteSummary({
        content: {
          documentIds: [5678, 9101],
          seismicIds: [],
          wells: {},
        },
      }),
    ];

    (useFavoritesQuery as jest.Mock).mockImplementation(() => ({
      data: mockedFavoriteData,
    }));

    const favoriteDocumentIds = getFavoriteDocumentIds();
    expect(favoriteDocumentIds).toEqual([1234, 5678, 9101]);
  });
});
