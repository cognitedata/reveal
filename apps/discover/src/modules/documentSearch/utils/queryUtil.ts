import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import set from 'lodash/set';

import {
  DocumentFilter,
  DocumentSearch,
  DocumentFilterGeoJsonIntersects,
} from '@cognite/sdk';
import { GeoJson, GeoJsonObject } from '@cognite/seismic-sdk-js';

import {
  LABELS_KEY,
  FILE_TYPE_KEY,
  SOURCE_KEY,
  PAGE_COUNT_KEY,
} from 'modules/documentSearch/constants';
import { SearchQueryFull, Result } from 'modules/documentSearch/types';

import { adaptLocalEpochToUTC } from '../../../utils/date/adaptLocalEpochToUTC';
import { DateRange } from '../types';

const generateGeoFilter = (
  geoJson: GeoJson[]
): DocumentFilterGeoJsonIntersects | null => {
  const coordinates = geoJson.map((item) => {
    const geometry = item.geometry as GeoJsonObject;
    if (isArray(geometry.coordinates)) {
      return geometry.coordinates[0] as unknown as [number, number];
    }

    return [0, 0];
  });
  return coordinates && coordinates.length > 0
    ? {
        geojsonIntersects: {
          property: ['geoLocation'],
          geometry: {
            type: 'Polygon',
            coordinates,
          },
        },
      }
    : null;
};

/*
 * Prepare the query and facets to send to the API
 *
 * Note: this function is horrific. Needs to be a tonne of smaller ones.
 */
export const getSearchQuery = (query: SearchQueryFull) => {
  let queryInfoResults: Result = {
    query: { query: '' },
    filter: undefined,
  };

  // concat filters
  const appendFilter = (filter: DocumentFilter) => {
    if (isEmpty(queryInfoResults.filter)) {
      set(queryInfoResults, 'filter.and', [filter]);
    } else {
      queryInfoResults = {
        ...queryInfoResults,
        filter: {
          ...queryInfoResults.filter,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore even though the filter is fully typed it doesn't recognize the '.and' as one of the allowed options
          and: [...(queryInfoResults.filter?.and || []), filter],
        },
      };
    }
  };
  // now we need to map the field filters to the API names
  const searchQuery: DocumentSearch['search'] = {
    query: query.phrase,
    highlight: false, // This will now be fetch pr document rather than for all documents at once to ease the load on the backend
  };

  if (query.phrase) {
    queryInfoResults.query = searchQuery;
  }

  // polygon
  const geoLocation =
    query.extraGeoJsonFilters && query.extraGeoJsonFilters[0]
      ? generateGeoFilter([
          {
            properties: {},
            geometry: query.extraGeoJsonFilters[0].geoJson,
          },
        ])
      : generateGeoFilter(query.geoFilter);

  if (geoLocation) {
    appendFilter(geoLocation);
  }

  const fileCategoryFacets = query.facets.fileCategory || [];

  const labelFacets = query.facets.labels || [];

  const locationFacets = query.facets.location || [];

  const lastmodifiedFacets = query.facets.lastmodified || [];

  const lastcreatedFacets = query.facets.lastcreated || [];

  const pageCount = query.facets.pageCount || [];

  // eg: pdf, image
  if (!isEmpty(fileCategoryFacets)) {
    appendFilter({
      in: {
        property: [FILE_TYPE_KEY],
        values: fileCategoryFacets,
      },
    });
  }

  // source
  if (!isEmpty(locationFacets)) {
    appendFilter({
      in: {
        property: SOURCE_KEY,
        values: locationFacets,
      },
    });
  }

  // document types, eg: drilling report
  if (!isEmpty(labelFacets)) {
    appendFilter({
      containsAny: {
        property: [LABELS_KEY],
        values: labelFacets,
      },
    });
  }

  if (!isEmpty(lastmodifiedFacets)) {
    const timeFilters: DateRange = {
      min: adaptLocalEpochToUTC(Number(lastmodifiedFacets[0])),
      max: adaptLocalEpochToUTC(Number(lastmodifiedFacets[1])),
    };
    if (timeFilters.min && timeFilters.max) {
      appendFilter({
        range: {
          property: ['modifiedTime'],
          gte: timeFilters.min,
          lt: timeFilters.max,
        },
      });
    }
  }

  if (!isEmpty(lastcreatedFacets)) {
    const timeFilters: DateRange = {
      min: adaptLocalEpochToUTC(Number(lastcreatedFacets[0])),
      max: adaptLocalEpochToUTC(Number(lastcreatedFacets[1])),
    };
    if (timeFilters.min && timeFilters.max) {
      appendFilter({
        range: {
          property: ['createdTime'],
          gte: timeFilters.min,
          lt: timeFilters.max,
        },
      });
    }
  }

  if (!isEmpty(pageCount)) {
    const pageCountFilters = {
      min: Number(pageCount[0]),
      max: Number(pageCount[1]),
    };
    appendFilter({
      range: {
        property: [PAGE_COUNT_KEY],
        gte: pageCountFilters.min,
        lt: pageCountFilters.max,
      },
    });
  }

  return queryInfoResults;
};
