import { renderHookWithStore } from '__test-utils/renderer';
import { getInitialStore, getMockedStore } from '__test-utils/store.utils';

import {
  useFilterDataNds,
  useFilterDataNpt,
  useFilterDataLog,
  useFilterDataTrajectory,
  useOverviewPageErrors,
  useInspectTabs,
} from '../selectors';

describe('inspect tabs selectors', () => {
  const store = getMockedStore();
  const initialState = getInitialStore();

  it('should return expected result with `useFilterDataNds` hook', () => {
    const { result } = renderHookWithStore(useFilterDataNds, store);
    expect(result.current).toEqual(initialState.inspectTabs?.nds);
  });

  it('should return expected result with `useFilterDataNpt` hook', () => {
    const { result } = renderHookWithStore(useFilterDataNpt, store);
    expect(result.current).toEqual(initialState.inspectTabs?.npt);
  });

  it('should return expected result with `useFilterDataLog` hook', () => {
    const { result } = renderHookWithStore(useFilterDataLog, store);
    expect(result.current).toEqual(initialState.inspectTabs?.log);
  });

  it('should return expected result with `useFilterDataTrajectory` hook', () => {
    const { result } = renderHookWithStore(useFilterDataTrajectory, store);
    expect(result.current).toEqual(initialState.inspectTabs?.trajectory);
  });

  it('should return expected result with `useOverviewPageErrors` hook', () => {
    const { result } = renderHookWithStore(useOverviewPageErrors, store);
    expect(result.current).toEqual(initialState.inspectTabs?.errors);
  });

  it('should return expected result with `useInspectTabs` hook', () => {
    const { result } = renderHookWithStore(useInspectTabs, store);
    expect(result.current).toEqual(initialState.inspectTabs);
  });
});
