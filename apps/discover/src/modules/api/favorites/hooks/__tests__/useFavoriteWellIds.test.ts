import { renderHook } from '@testing-library/react-hooks';

import { getMockFavoriteSummary } from '__test-utils/fixtures/favorite';
import { useFavoritesGetAllQuery } from 'modules/api/favorites/useFavoritesQuery';
import { FavoriteSummary } from 'modules/favorite/types';

import { useFavoriteWellIds } from '../useFavoriteWellIds';

jest.mock('modules/api/favorites/useFavoritesQuery', () => ({
  useFavoritesGetAllQuery: jest.fn(),
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
    (useFavoritesGetAllQuery as jest.Mock).mockImplementation(() => ({
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

    (useFavoritesGetAllQuery as jest.Mock).mockImplementation(() => ({
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
