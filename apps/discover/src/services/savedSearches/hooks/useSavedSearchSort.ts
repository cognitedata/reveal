import { useMutatePatchSavedSearch } from 'services/savedSearches/useSavedSearchQuery';

import { SavedSearchSortBy } from '@cognite/discover-api-types';

export const useSavedSearchSort = () => {
  const { mutate } = useMutatePatchSavedSearch();
  return (sortBy: SavedSearchSortBy) => mutate({ sortBy });
};

export const useSavedSearchSortClear = () => {
  const { mutate } = useMutatePatchSavedSearch();
  return () => mutate({ sortBy: { documents: [] } });
};
