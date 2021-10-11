import { SearchState } from './types';

export const SET_SEARCHING = 'search/SET_SEARCHING';
export interface SetSearching {
  type: typeof SET_SEARCHING;
  isSearching: SearchState['isSearching'];
}
const setSearching = (
  isSearching: SearchState['isSearching']
): SearchAction => ({
  type: SET_SEARCHING,
  isSearching,
});

export const startSearching = () => setSearching(true);
export const stopSearching = () => setSearching(false);

export const SET_LOADING = 'search/SET_LOADING';
export interface SetLoading {
  type: typeof SET_LOADING;
  isLoading: SearchState['isLoading'];
}
const setLoading = (isLoading: SearchState['isLoading']): SearchAction => ({
  type: SET_LOADING,
  isLoading,
});

export const startLoading = () => setLoading(true);
export const stopLoading = () => setLoading(false);

export const SET_SEARCH_RESULTS_SHOWING = 'search/SET_SEARCH_RESULTS_SHOWING';
export interface SetResultsShowing {
  type: typeof SET_SEARCH_RESULTS_SHOWING;
  showSearchResults: SearchState['showSearchResults'];
}
const setResultsShowing = (
  showSearchResults: SearchState['showSearchResults']
): SearchAction => ({
  type: SET_SEARCH_RESULTS_SHOWING,
  showSearchResults,
});
export const showResults = () => setResultsShowing(true);
export const hideResults = () => setResultsShowing(false);

export type SearchAction = SetSearching | SetLoading | SetResultsShowing;
