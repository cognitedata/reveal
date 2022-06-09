import { usePatchSavedSearchMutate } from 'domain/savedSearches/internal/actions/usePatchSavedSearchMutate';

export const useClearWellsFilters = () => {
  const { mutate } = usePatchSavedSearchMutate();
  return () =>
    mutate({ geoJson: [], filters: { wells: {}, extraGeoJsonFilters: [] } });
};
