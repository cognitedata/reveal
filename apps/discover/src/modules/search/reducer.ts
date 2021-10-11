import {
  SET_SEARCH_RESULTS_SHOWING,
  SET_SEARCHING,
  SET_LOADING,
  SearchAction,
} from './actions';
import { SearchState } from './types';

export const initialState: SearchState = {
  isSearching: false,
  isLoading: false,
  showSearchResults: false,
};

export function search(
  state: SearchState = initialState,
  action: SearchAction
): SearchState {
  switch (action.type) {
    case SET_SEARCHING:
      return {
        ...state,
        isSearching: action.isSearching,
      };
    case SET_LOADING:
      return {
        ...state,
        isLoading: action.isLoading,
      };
    case SET_SEARCH_RESULTS_SHOWING:
      return {
        ...state,
        showSearchResults: action.showSearchResults,
      };
    default:
      return state;
  }
}
