import { usePatchSavedSearchMutate } from 'domain/savedSearches/internal/actions/usePatchSavedSearchMutate';

import { WellFilterMapValue } from 'modules/wellSearch/types';

export const useSetWellsFiltersAsync = () => {
  const { mutateAsync } = usePatchSavedSearchMutate();
  return (wells: { [x: number]: WellFilterMapValue }) =>
    mutateAsync({ filters: { wells } });
};
