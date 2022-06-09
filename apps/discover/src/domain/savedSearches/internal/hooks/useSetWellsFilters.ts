import { usePatchSavedSearchMutate } from 'domain/savedSearches/internal/actions/usePatchSavedSearchMutate';

import { WellFilterMapValue } from 'modules/wellSearch/types';

export const useSetWellsFilters = () => {
  const { mutate } = usePatchSavedSearchMutate();
  return (wells: { [x: number]: WellFilterMapValue }) =>
    mutate({ filters: { wells } });
};
