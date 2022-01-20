import { useMutatePatchSavedSearch } from 'modules/api/savedSearches/useSavedSearchQuery';

import { SavedSearchContent } from '../types';

export const useSavedSearch = () => {
  const { mutate } = useMutatePatchSavedSearch();
  return (savedSearch: SavedSearchContent) => mutate(savedSearch);
};
