import { useSearchState } from 'modules/search/selectors';
import { useWells } from 'modules/wellSearch/selectors';

export const useAnythingHasSearched = () => {
  const globalSearch = useSearchState();
  const wellState = useWells();

  if (globalSearch.showSearchResults) {
    return true;
  }

  // change search results to check for the search flag, not the results:
  const hasSearchedWells = wellState.currentQuery.hasSearched;

  return hasSearchedWells || globalSearch.isSearching;
};
