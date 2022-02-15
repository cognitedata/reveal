import { useMutatePatchSavedSearch } from 'services/savedSearches/useSavedSearchQuery';

import { SavedSearchContent } from '../types';

export const useSavedSearch = () => {
  const { mutate } = useMutatePatchSavedSearch();
  return (savedSearch: SavedSearchContent) => mutate(savedSearch);
};
