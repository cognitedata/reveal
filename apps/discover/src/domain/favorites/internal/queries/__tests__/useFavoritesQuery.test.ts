import {
  useFavoriteDuplicateMutate,
  useFavoritesCreateMutate,
  useFavoritesDeleteMutate,
  useFavoriteShareMutate,
  useFavoritesUpdateMutate,
  useFavoriteUpdateContent,
} from 'domain/favorites/internal/actions/useFavoritesMutate';
import { createFavorite } from 'domain/favorites/service/network/createFavorite';
import { deleteFavorite } from 'domain/favorites/service/network/deleteFavorite';
import { duplicateFavorite } from 'domain/favorites/service/network/duplicateFavorite';
import { getFavorite } from 'domain/favorites/service/network/getFavorite';
import { shareFavorite } from 'domain/favorites/service/network/shareFavorite';
import { updateFavorite } from 'domain/favorites/service/network/updateFavorite';
import { updateFavoriteContent } from 'domain/favorites/service/network/updateFavoriteContent';

import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { QueryClientWrapper } from '__test-utils/queryClientWrapper';

import { useFavoriteQuery } from '../useFavoriteQuery';

const id = '12345';
const name = 'test-name';

jest.mock('domain/favorites/service/network/createFavorite', () => ({
  createFavorite: jest.fn(),
}));
jest.mock('domain/favorites/service/network/deleteFavorite', () => ({
  deleteFavorite: jest.fn(),
}));
jest.mock('domain/favorites/service/network/duplicateFavorite', () => ({
  duplicateFavorite: jest.fn(),
}));
jest.mock('domain/favorites/service/network/getFavorite', () => ({
  getFavorite: jest.fn(),
}));
jest.mock('domain/favorites/service/network/shareFavorite', () => ({
  shareFavorite: jest.fn(),
}));
jest.mock('domain/favorites/service/network/updateFavorite', () => ({
  updateFavorite: jest.fn(),
}));
jest.mock('domain/favorites/service/network/updateFavoriteContent', () => ({
  updateFavoriteContent: jest.fn(),
}));

describe('useFavoriteQuery hooks', () => {
  const getHookResult = async (hook: any) => {
    const { result, waitForNextUpdate } = renderHook(() => hook(), {
      wrapper: QueryClientWrapper,
    });
    waitForNextUpdate();
    return result.current;
  };

  it('useFavoritesCreateMutate', async () => {
    const { mutateAsync } = await getHookResult(useFavoritesCreateMutate);
    await mutateAsync({ name });
    await waitFor(() => expect(createFavorite).toBeCalledTimes(1));
  });

  it('useFavoriteDuplicateMutate', async () => {
    const { mutateAsync } = await getHookResult(useFavoriteDuplicateMutate);
    await mutateAsync({ id, name });
    await waitFor(() => expect(duplicateFavorite).toBeCalledTimes(1));
  });

  it('useFavoritesUpdateMutate', async () => {
    const { mutateAsync } = await getHookResult(useFavoritesUpdateMutate);
    await mutateAsync({ id, updateData: {} });
    await waitFor(() => expect(updateFavorite).toBeCalledTimes(1));
  });

  it('useFavoriteUpdateContent', async () => {
    const { mutateAsync } = await getHookResult(useFavoriteUpdateContent);
    await mutateAsync({ id, updateData: {} });
    await waitFor(() => expect(updateFavoriteContent).toBeCalledTimes(1));
  });

  it('useFavoritesDeleteMutate', async () => {
    const { mutateAsync } = await getHookResult(useFavoritesDeleteMutate);
    await mutateAsync(id);
    await waitFor(() => expect(deleteFavorite).toBeCalledTimes(1));
  });

  it('useFavoriteShareMutate', async () => {
    const { mutateAsync } = await getHookResult(useFavoriteShareMutate);
    await mutateAsync({ favoriteId: id, userIds: [] });
    await waitFor(() => expect(shareFavorite).toBeCalledTimes(1));
  });

  it('useFavoriteQuery', async () => {
    await getHookResult(() => useFavoriteQuery(id));
    await waitFor(() => expect(getFavorite).toBeCalledTimes(1));
  });
});
