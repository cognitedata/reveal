import { SavedSearchSortBy } from '@cognite/discover-api-types';

import { useMutatePatchSavedSearch } from 'modules/api/savedSearches/useQuery';

export const useSavedSearchSort = () => {
  const { mutate } = useMutatePatchSavedSearch();
  return (sortBy: SavedSearchSortBy) => mutate({ sortBy });
};

export const useSavedSearchSortClear = () => {
  const { mutate } = useMutatePatchSavedSearch();
  return () => mutate({ sortBy: { documents: [] } });
};
