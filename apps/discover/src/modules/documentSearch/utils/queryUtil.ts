import isArray from 'lodash/isArray';
import set from 'lodash/set';

import {
  DocumentsFilter,
  DocumentsSearch,
  GeoLocationFilter,
} from '@cognite/sdk-playground';
import { GeoJson, GeoJsonObject } from '@cognite/seismic-sdk-js';

import {
  LABELS_KEY,
  FILE_TYPE_KEY,
  LAST_UPDATED_KEY,
  LAST_CREATED_KEY,
  SOURCE_KEY,
} from 'modules/documentSearch/constants';
import {
  SearchQueryFull,
  Result,
  DateRange,
} from 'modules/documentSearch/types';

const generateGeoFilter = (geoJson: GeoJson[]): GeoLocationFilter | null => {
  const coordinates = geoJson.map((item) => {
    const geometry = item.geometry as GeoJsonObject;
    if (isArray(geometry.coordinates)) {
      return geometry.coordinates[0] as unknown as [number, number];
    }

    return [0, 0];
  });
  return coordinates && coordinates.length > 0
    ? ({
        shape: {
          type: 'Polygon',
          coordinates,
        },
        relation: 'intersects',
      } as any)
    : null;
};

/*
 * Prepare the query and facets to send to the API
 *
 * Note: this function is horrific. Needs to be a tonne of smaller ones.
 */
export const getSearchQuery = (query: SearchQueryFull) => {
  const queryInfoResults: Result = {
    query: { query: '' },
    filter: {},
  };

  // now we need to map the field filters to the API names
  const searchQuery: DocumentsSearch = {
    query: query.phrase,
    highlight: false, // This will now be fetch pr document rather than for all documents at once to ease the load on the backend
  };

  if (query.phrase) {
    queryInfoResults.query = searchQuery;
  }

  // polygon
  const geoLocation = generateGeoFilter(query.geoFilter);
  if (geoLocation) {
    queryInfoResults.filter.geoLocation = geoLocation;
  }

  const queryFilters: DocumentsFilter = {};

  const filetypeFacets = query.facets.filetype || [];

  const labelFacets = query.facets.labels || [];

  const locationFacets = query.facets.location || [];

  const lastmodifiedFacets = query.facets.lastmodified || [];

  const lastcreatedFacets = query.facets.lastcreated || [];

  // eg: pdf, image
  if (filetypeFacets.length > 0) {
    set(queryFilters, FILE_TYPE_KEY, {
      in: filetypeFacets,
    });
  }

  // source
  if (locationFacets.length > 0) {
    set(queryFilters, SOURCE_KEY, {
      in: locationFacets,
    });
  }

  // document types, eg: drilling report
  if (labelFacets.length > 0) {
    set(queryFilters, LABELS_KEY, {
      containsAny: labelFacets,
    });
  }

  if (lastmodifiedFacets.length > 0) {
    const timeFilters: DateRange = {
      min: Number(lastmodifiedFacets[0]),
      max: Number(lastmodifiedFacets[1]),
    };
    if (timeFilters.min && timeFilters.max) {
      set(queryFilters, LAST_UPDATED_KEY, timeFilters);
    }
  }

  if (lastcreatedFacets.length > 0) {
    const timeFilters: DateRange = {
      min: Number(lastcreatedFacets[0]),
      max: Number(lastcreatedFacets[1]),
    };
    if (timeFilters.min && timeFilters.max) {
      set(queryFilters, LAST_CREATED_KEY, timeFilters);
    }
  }

  queryInfoResults.filter = {
    ...queryInfoResults.filter,
    ...queryFilters,
  };

  return queryInfoResults;
};
