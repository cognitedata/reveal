import { getMockFavoriteSummary } from 'domain/favorites/service/__fixtures/favorite';

import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { FavoriteSummary } from 'modules/favorite/types';

import {
  useDocumentExistInFavorite,
  useHandleSelectFavourite,
  useWellExistInFavorite,
} from '../useFavorite';

jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQueryClient: () => ({
    setQueryData: jest.fn(),
  }),
  useQuery: () => ({ isLoading: false, error: {}, data: [] }),
}));

jest.mock('domain/favorites/internal/actions/useFavoritesMutate', () => ({
  useFavoriteUpdateContent: () => ({
    mutateAsync: () => Promise.resolve(true),
  }),
}));

describe('Use Favorite', () => {
  it(`should filter favorite ids`, async () => {
    const favorite: FavoriteSummary = {
      ...getMockFavoriteSummary(),
      ...{
        id: '12',
        content: { documentIds: [12], seismicIds: [], wells: {} },
      },
    };
    const { result } = renderHook(
      () => useDocumentExistInFavorite([favorite], 12),
      {}
    );

    expect(result.current[0]).toEqual('12');
  });

  it(`should not filter favorite ids`, async () => {
    const favorite: FavoriteSummary = {
      ...getMockFavoriteSummary(),
      ...{
        id: '12',
        content: { documentIds: [23], seismicIds: [], wells: {} },
      },
    };
    const { result } = renderHook(
      () => useDocumentExistInFavorite([favorite], 12),
      {}
    );

    expect(result.current[0]).toEqual(undefined);
  });

  it(`should filter wells favorite ids`, async () => {
    const favorite: FavoriteSummary = {
      ...getMockFavoriteSummary(),
      ...{
        id: '12',
        content: { documentIds: [], seismicIds: [], wells: { '12': [] } },
      },
    };
    const { result } = renderHook(
      () => useWellExistInFavorite([favorite], 12),
      {}
    );

    expect(result.current[0]).toEqual('12');
  });

  it(`should not filter wells favorite ids`, async () => {
    const favorite: FavoriteSummary = {
      ...getMockFavoriteSummary(),
      ...{
        id: '12',
        content: { documentIds: [], seismicIds: [], wells: { '23': [] } },
      },
    };
    const { result } = renderHook(
      () => useWellExistInFavorite([favorite], 12),
      {}
    );

    expect(result.current[0]).toEqual(undefined);
  });

  it(`should update favorites`, async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useHandleSelectFavourite(),
      {}
    );

    const { handleFavoriteUpdate } = result.current;
    const documentCallback = jest.fn();
    const wellCallback = jest.fn();
    handleFavoriteUpdate(
      '12',
      [12],
      { '32': [] },
      documentCallback,
      wellCallback
    );

    waitForNextUpdate();

    await waitFor(() => expect(documentCallback).toBeCalledTimes(1));
    await waitFor(() => expect(wellCallback).toBeCalledTimes(1));
  });

  it(`should not update favorites`, async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useHandleSelectFavourite(),
      {}
    );

    const { handleFavoriteUpdate } = result.current;
    const documentCallback = jest.fn();
    const wellCallback = jest.fn();
    handleFavoriteUpdate('12', [], {}, documentCallback, wellCallback);

    waitForNextUpdate();

    expect(documentCallback).toBeCalledTimes(0);
    expect(wellCallback).toBeCalledTimes(0);
  });
});
