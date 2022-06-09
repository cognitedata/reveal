import { usePatchSavedSearchMutate } from 'domain/savedSearches/internal/actions/usePatchSavedSearchMutate';

import isArray from 'lodash/isArray';
import { isOfType } from 'utils/type';

import { Geometry, GeoJson } from '@cognite/seismic-sdk-js';

import { convertGeometryToGeoJson } from '../transformers/normalizeSavedSearch';

export const useClearPolygon = () => {
  const { mutateAsync } = usePatchSavedSearchMutate();
  return () => mutateAsync({ geoJson: [] });
};

/*
 * This will set the right key on the saved searches, to all for backwards compat.
 *
 * The good key to use is 'geoJson', since it is a more advanced object, with 'id' etc.
 */
export const useSetPolygon = () => {
  const { mutateAsync } = usePatchSavedSearchMutate();
  return (geometry: Geometry | GeoJson | GeoJson[]) => {
    if (isArray(geometry)) {
      return mutateAsync({
        geoJson: geometry,
        filters: { extraGeoJsonFilters: [] },
      });
    }

    if (isOfType<GeoJson>(geometry, 'geometry')) {
      return mutateAsync({
        geoJson: [geometry],
        filters: { extraGeoJsonFilters: [] },
      });
    }

    // old way:
    return mutateAsync({
      geoJson: [convertGeometryToGeoJson(geometry)],
      filters: { extraGeoJsonFilters: [] },
    });
  };
};
