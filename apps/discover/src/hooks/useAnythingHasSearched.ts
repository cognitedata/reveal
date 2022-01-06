import { useSearchState } from 'modules/search/selectors';

export const useAnythingHasSearched = () => {
  const globalSearch = useSearchState();

  if (globalSearch.showSearchResults) {
    return true;
  }

  return globalSearch.isSearching;
};
