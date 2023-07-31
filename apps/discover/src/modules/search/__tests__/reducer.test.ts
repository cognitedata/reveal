import {
  SET_LOADING,
  SET_SEARCHING,
  SET_SEARCH_RESULTS_SHOWING,
} from '../actions';
import { initialState, search } from '../reducer';

describe('search reducer', () => {
  it('should return initial state with empty action', () => {
    expect(search(initialState)).toEqual(initialState);
  });

  it('should return assigned `isSearching` value', () => {
    const state = search(initialState, {
      type: SET_SEARCHING,
      isSearching: true,
    });

    expect(state.isSearching).toBeTruthy();
  });

  it('should return assigned `isLoading` value', () => {
    const state = search(initialState, {
      type: SET_LOADING,
      isLoading: true,
    });

    expect(state.isLoading).toBeTruthy();
  });

  it('should return assigned `showSearchResults` value', () => {
    const state = search(initialState, {
      type: SET_SEARCH_RESULTS_SHOWING,
      showSearchResults: true,
    });

    expect(state.showSearchResults).toBeTruthy();
  });
});
