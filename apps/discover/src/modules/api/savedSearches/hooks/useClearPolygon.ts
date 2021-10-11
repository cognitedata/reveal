import isArray from 'lodash/isArray';

import { Geometry, GeoJson } from '@cognite/seismic-sdk-js';

import { isOfType } from '_helpers/type';
import { useMutatePatchSavedSearch } from 'modules/api/savedSearches/useQuery';

import { convertGeometryToGeoJson } from '../normalizeSavedSearch';

export const useClearPolygon = () => {
  const { mutateAsync } = useMutatePatchSavedSearch();
  return () => mutateAsync({ geoJson: [] });
};

/*
 * This will set the right key on the saved searches, to all for backwards compat.
 *
 * The good key to use is 'geoJson', since it is a more advanced object, with 'id' etc.
 */
export const useSetPolygon = () => {
  const { mutateAsync } = useMutatePatchSavedSearch();
  return (geometry: Geometry | GeoJson | GeoJson[]) => {
    if (isArray(geometry)) {
      return mutateAsync({ geoJson: geometry });
    }

    if (isOfType<GeoJson>(geometry, 'geometry')) {
      return mutateAsync({ geoJson: [geometry] });
    }

    // old way:
    return mutateAsync({ geoJson: [convertGeometryToGeoJson(geometry)] });
  };
};
