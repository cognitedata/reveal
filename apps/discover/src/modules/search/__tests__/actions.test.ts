import { getMockedStore } from '__test-utils/store.utils';

import {
  startSearching,
  stopSearching,
  startLoading,
  stopLoading,
  showResults,
  hideResults,
  SET_SEARCHING,
  SET_LOADING,
  SET_SEARCH_RESULTS_SHOWING,
} from '../actions';

describe('search actions', () => {
  it('should set `isSearch` as true', async () => {
    const store = getMockedStore();

    store.dispatch(startSearching());
    expect(store.getActions()).toEqual([
      { isSearching: true, type: SET_SEARCHING },
    ]);
  });

  it('should set `isSearch` as false', async () => {
    const store = getMockedStore();

    store.dispatch(stopSearching());
    expect(store.getActions()).toEqual([
      { isSearching: false, type: SET_SEARCHING },
    ]);
  });

  it('should set `isLoading` as true', async () => {
    const store = getMockedStore();

    store.dispatch(startLoading());
    expect(store.getActions()).toEqual([
      { isLoading: true, type: SET_LOADING },
    ]);
  });

  it('should set `isLoading` as false', async () => {
    const store = getMockedStore();

    store.dispatch(stopLoading());
    expect(store.getActions()).toEqual([
      { isLoading: false, type: SET_LOADING },
    ]);
  });

  it('should set `showSearchResults` as true', async () => {
    const store = getMockedStore();

    store.dispatch(showResults());
    expect(store.getActions()).toEqual([
      { showSearchResults: true, type: SET_SEARCH_RESULTS_SHOWING },
    ]);
  });

  it('should set `showSearchResults` as false', async () => {
    const store = getMockedStore();

    store.dispatch(hideResults());
    expect(store.getActions()).toEqual([
      { showSearchResults: false, type: SET_SEARCH_RESULTS_SHOWING },
    ]);
  });
});
