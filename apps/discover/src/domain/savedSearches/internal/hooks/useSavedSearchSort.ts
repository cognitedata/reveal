import { usePatchSavedSearchMutate } from 'domain/savedSearches/internal/actions/usePatchSavedSearchMutate';

import { SavedSearchSortBy } from '@cognite/discover-api-types';

export const useSavedSearchSort = () => {
  const { mutate } = usePatchSavedSearchMutate();
  return (sortBy: SavedSearchSortBy) => mutate({ sortBy });
};

export const useSavedSearchSortClear = () => {
  const { mutate } = usePatchSavedSearchMutate();
  return () => mutate({ sortBy: { documents: [] } });
};
