import { renderHookWithStore } from '__test-utils/renderer';
import { getInitialStore, getMockedStore } from '__test-utils/store.utils';

import { useSearchState } from '../selectors';

describe('search selectors', () => {
  const store = getMockedStore();
  const initialState = getInitialStore();

  it('should return expected result with `useSearchState` hook', () => {
    const { result } = renderHookWithStore(useSearchState, store);
    expect(result.current).toEqual(initialState.search);
  });
});
