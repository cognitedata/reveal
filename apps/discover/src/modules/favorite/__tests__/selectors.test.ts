import { renderHookWithStore } from '__test-utils/renderer';
import { getInitialStore, getMockedStore } from '__test-utils/store.utils';

import {
  useFavourite,
  useIsCreateFavoriteModalOpenSelector,
  useItemsToAddOnFavoriteCreationSelector,
  useViewMode,
} from '../selectors';

describe('favorite selectors', () => {
  const store = getMockedStore();
  const initialState = getInitialStore();

  it('should return expected result with `useFavourite` hook', () => {
    const { result } = renderHookWithStore(useFavourite, store);
    expect(result.current).toEqual(initialState.favorites);
  });

  it('should return expected result with `useIsCreateFavoriteModalOpenSelector` hook', () => {
    const { result } = renderHookWithStore(
      useIsCreateFavoriteModalOpenSelector,
      store
    );
    expect(result.current).toEqual(
      initialState.favorites?.isCreateModalVisible
    );
  });

  it('should return expected result with `useItemsToAddOnFavoriteCreationSelector` hook', () => {
    const { result } = renderHookWithStore(
      useItemsToAddOnFavoriteCreationSelector,
      store
    );
    expect(result.current).toEqual(
      initialState.favorites?.itemsToAddOnFavoriteCreation
    );
  });

  it('should return expected result with `useViewMode` hook', () => {
    const { result } = renderHookWithStore(useViewMode, store);
    expect(result.current).toEqual(initialState.favorites?.viewMode);
  });
});
