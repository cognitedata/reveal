import isEmpty from 'lodash/isEmpty';
import set from 'lodash/set';
import { DocumentFilter, DocumentSearch } from '@cognite/sdk';

import { SearchQueryFull, Result, DateRange } from './types';
import {
  DOCUMENT_KEYS,
  LABELS_KEY,
  FILE_TYPE_KEY,
  SOURCE_KEY,
  PAGE_COUNT_KEY,
} from './constants';
import { adaptLocalEpochToUTC } from './date';
import { getGeoFilter } from './getGeoFilter';

/*
 * Prepare the query and facets to send to the API
 *
 * Note: this function is horrific. Needs to be a tonne of smaller ones.
 */
export const getSearchQuery = (query: SearchQueryFull) => {
  let queryInfoResults: Result = {
    query: { query: '', highlight: true },
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
  };

  if (query.phrase) {
    queryInfoResults.query = searchQuery;
  }

  // polygon
  const geoLocation =
    query.extraGeoJsonFilters && query.extraGeoJsonFilters[0]
      ? getGeoFilter([
          {
            properties: {},
            geometry: query.extraGeoJsonFilters[0].geoJson,
          },
        ])
      : getGeoFilter(query.geoFilter);

  if (geoLocation) {
    appendFilter(geoLocation);
  }

  const fileCategoryFacets = query.facets.fileCategory || [];

  const labelFacets = query.facets.labels || [];

  const locationFacets = query.facets.location || [];

  const lastmodifiedFacets = query.facets.lastmodified || [];

  const lastcreatedFacets = query.facets.lastcreated || [];

  const pageCount = query.facets.pageCount || [];

  const authorFacets = query.facets.authors || [];

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
          property: DOCUMENT_KEYS.MODIFIED_TIME,
          gte: timeFilters.min,
          lte: timeFilters.max,
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
          property: DOCUMENT_KEYS.CREATED_TIME,
          gte: timeFilters.min,
          lte: timeFilters.max,
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
        lte: pageCountFilters.max,
      },
    });
  }

  if (!isEmpty(authorFacets)) {
    appendFilter({
      in: {
        property: ['author'],
        values: authorFacets,
      },
    });
  }

  return queryInfoResults;
};
