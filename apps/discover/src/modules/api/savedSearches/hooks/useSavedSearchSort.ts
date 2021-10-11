import { useMutatePatchSavedSearch } from 'modules/api/savedSearches/useQuery';

import { SearchOptionSortBy } from '../types';

export const useSavedSearchSort = () => {
  const { mutate } = useMutatePatchSavedSearch();
  return (sortBy: SearchOptionSortBy) => mutate({ sortBy });
};

export const useSavedSearchSortClear = () => {
  const { mutate } = useMutatePatchSavedSearch();
  return () => mutate({ sortBy: { documents: [] } });
};
