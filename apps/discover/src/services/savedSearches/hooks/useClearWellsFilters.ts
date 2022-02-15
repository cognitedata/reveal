import { useMutatePatchSavedSearch } from 'services/savedSearches/useSavedSearchQuery';

import { WellFilterMapValue } from 'modules/wellSearch/types';

export const useClearWellsFilters = () => {
  const { mutate } = useMutatePatchSavedSearch();
  return () => mutate({ filters: { wells: {} } });
};

export const useSetWellsFilters = () => {
  const { mutate } = useMutatePatchSavedSearch();
  return (wells: { [x: number]: WellFilterMapValue }) =>
    mutate({ filters: { wells } });
};

export const useSetWellsFiltersAsync = () => {
  const { mutateAsync } = useMutatePatchSavedSearch();
  return (wells: { [x: number]: WellFilterMapValue }) =>
    mutateAsync({ filters: { wells } });
};
