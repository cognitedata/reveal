import { renderHook } from '@testing-library/react-hooks';
import { getMockFavoriteSummary } from 'services/favorites/__fixtures/favorite';
import { useFavoritesGetAllQuery } from 'services/favorites/useFavoritesQuery';

import { FavoriteSummary } from 'modules/favorite/types';

import { useFavoriteDocumentIds } from '../useFavoriteDocumentIds';

jest.mock('services/favorites/useFavoritesQuery', () => ({
  useFavoritesGetAllQuery: jest.fn(),
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
    (useFavoritesGetAllQuery as jest.Mock).mockImplementation(() => ({
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

    (useFavoritesGetAllQuery as jest.Mock).mockImplementation(() => ({
      data: mockedFavoriteData,
    }));

    const favoriteDocumentIds = getFavoriteDocumentIds();
    expect(favoriteDocumentIds).toEqual([1234, 5678, 9101]);
  });
});
