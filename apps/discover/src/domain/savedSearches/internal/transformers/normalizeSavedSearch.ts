import get from 'lodash/get';
import { isOfType } from 'utils/type';

import { Geometry, GeoJson } from '@cognite/seismic-sdk-js';

import { SavedSearchContent, SavedSearchQuery } from '../../types';

export const convertGeometryToGeoJson = (
  geometry: Geometry,
  type = 'Feature',
  id = ''
): GeoJson => {
  return {
    geometry,
    id: id || type,
    properties: {},
    type,
  };
};

export const normalizeSavedSearch = (
  savedSearch: Partial<SavedSearchContent> | Partial<SavedSearchQuery> // SavedSearchQuery is deprecated
): SavedSearchContent => {
  const query: SavedSearchContent = {
    filters: savedSearch.filters || {},
    sortBy: savedSearch.sortBy || {},
  };

  // deprecated, use 'query' instead
  if ('phrase' in savedSearch) {
    query.query = savedSearch.phrase;
  }
  if ('query' in savedSearch) {
    query.query = savedSearch.query;
  }

  let foundGeo:
    | SavedSearchContent['geoJson']
    | SavedSearchQuery['geoFilter']
    | undefined;

  // deprecated, use 'geoJson' instead
  if ('geometry' in savedSearch) {
    foundGeo = [convertGeometryToGeoJson(get(savedSearch, 'geometry'))];
  }

  // deprecated, use 'geoJson' instead
  if ('geoFilter' in savedSearch) {
    foundGeo = savedSearch.geoFilter;
  }

  if ('geoJson' in savedSearch) {
    if (isOfType<Geometry>(savedSearch.geoJson, 'type')) {
      foundGeo = [convertGeometryToGeoJson(savedSearch.geoJson)];
    } else {
      foundGeo = savedSearch.geoJson;
    }
  }

  if (foundGeo) {
    query.geoJson = foundGeo;
  }

  if (!query.filters) {
    query.filters = {};
  }

  if (!query.sortBy) {
    query.sortBy = {};
  }

  if (!query.query) {
    query.query = '';
  }

  if (!query.geoJson) {
    query.geoJson = [];
  }

  return query;
};
