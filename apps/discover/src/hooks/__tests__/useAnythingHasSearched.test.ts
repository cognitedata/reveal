import { renderHook } from '@testing-library/react-hooks';
import { AppStore } from 'core';

import { testWrapper } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useAnythingHasSearched } from 'hooks/useAnythingHasSearched';

describe('useAnythingHasSearched hook', () => {
  const renderHookWithStore = async (store: AppStore) => {
    const { result, waitForNextUpdate } = renderHook(
      () => useAnythingHasSearched(),
      {
        wrapper: ({ children }) => testWrapper({ store, children }),
      }
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return true when `showSearchResults` is true', async () => {
    const store = getMockedStore({
      search: { showSearchResults: true },
    });
    const view = await renderHookWithStore(store);
    expect(view).toBeTruthy();
  });
});
