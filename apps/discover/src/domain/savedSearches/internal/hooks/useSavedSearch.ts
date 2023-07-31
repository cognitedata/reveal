import { usePatchSavedSearchMutate } from 'domain/savedSearches/internal/actions/usePatchSavedSearchMutate';

import { SavedSearchContent } from '../../types';

export const useSavedSearch = () => {
  const { mutate } = usePatchSavedSearchMutate();
  return (savedSearch: SavedSearchContent) => mutate(savedSearch);
};
