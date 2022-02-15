import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { discoverAPI } from 'services/service';

import { QueryClientWrapper } from '__test-utils/queryClientWrapper';

import { favorites } from '../favorites';
import {
  useFavoriteDuplicateMutate,
  useFavoritesCreateMutate,
  useFavoritesDeleteMutate,
  useFavoriteShareMutate,
  useFavoritesUpdateMutate,
  useFavoriteUpdateContent,
} from '../useFavoritesMutate';
import { useFavoritesGetOneQuery } from '../useFavoritesQuery';

const favoriteSpy: { [method: string]: jest.SpyInstance } = {};

const id = '12345';
const name = 'test-name';

describe('useFavoriteQuery hooks', () => {
  beforeEach(() =>
    Object.keys(favorites).forEach((method: any) => {
      const spy = jest
        .spyOn(discoverAPI.favorites, method)
        .mockImplementation(() => Promise.resolve(method));
      favoriteSpy[method] = spy;
    })
  );

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
    await waitFor(() => expect(favoriteSpy.create).toBeCalledTimes(1));
  });

  it('useFavoriteDuplicateMutate', async () => {
    const { mutateAsync } = await getHookResult(useFavoriteDuplicateMutate);
    await mutateAsync({ id, name });
    await waitFor(() => expect(favoriteSpy.duplicate).toBeCalledTimes(1));
  });

  it('useFavoritesUpdateMutate', async () => {
    const { mutateAsync } = await getHookResult(useFavoritesUpdateMutate);
    await mutateAsync({ id, updateData: {} });
    await waitFor(() => expect(favoriteSpy.update).toBeCalledTimes(1));
  });

  it('useFavoriteUpdateContent', async () => {
    const { mutateAsync } = await getHookResult(useFavoriteUpdateContent);
    await mutateAsync({ id, updateData: {} });
    await waitFor(() =>
      expect(favoriteSpy.updateFavoriteContent).toBeCalledTimes(1)
    );
  });

  it('useFavoritesDeleteMutate', async () => {
    const { mutateAsync } = await getHookResult(useFavoritesDeleteMutate);
    await mutateAsync(id);
    await waitFor(() => expect(favoriteSpy.delete).toBeCalledTimes(1));
  });

  it('useFavoriteShareMutate', async () => {
    const { mutateAsync } = await getHookResult(useFavoriteShareMutate);
    await mutateAsync({ favoriteId: id, userIds: [] });
    await waitFor(() => expect(favoriteSpy.share).toBeCalledTimes(1));
  });

  it('useFavoritesGetOneQuery', async () => {
    await getHookResult(() => useFavoritesGetOneQuery(id));
    await waitFor(() => expect(favoriteSpy.getOne).toBeCalledTimes(1));
  });
});
