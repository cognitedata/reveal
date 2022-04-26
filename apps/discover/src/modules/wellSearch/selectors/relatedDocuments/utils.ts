import chunk from 'lodash/chunk';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { SavedSearchContent } from 'services/savedSearches';

import { DocumentCategories } from '@cognite/discover-api-types';

import {
  BatchedDocumentsFilters,
  DocumentResultFacets,
  SearchQueryFull,
} from 'modules/documentSearch/types';
import { getEmptyDocumentStateFacets } from 'modules/documentSearch/utils';

export const formatAssetIdsFilter = (
  selectedWellboreIds: string[] | number[],
  v3Enabled: boolean,
  limit = 100
): BatchedDocumentsFilters => {
  let key = 'assetExternalIds';

  if (!v3Enabled) {
    key = 'assetIds';
  }

  if (isEmpty(selectedWellboreIds)) {
    return [];
  }

  const batchSelectedWellboreIds = chunk<string | number>(
    selectedWellboreIds,
    limit
  );

  return batchSelectedWellboreIds.map((wellboreIds) => {
    return {
      filters: {
        containsAny: {
          property: [key],
          values: wellboreIds,
        },
      },
    };
  });
};

export const getFilterQuery = (searchOption?: SavedSearchContent) => ({
  phrase: searchOption?.query || '',
  geoFilter: [],
  facets: {
    fileCategory: searchOption?.filters.documents?.facets.fileCategory || [],
    labels: searchOption?.filters.documents?.facets.labels || [],
    lastcreated: searchOption?.filters.documents?.facets.lastcreated || [],
    lastmodified: searchOption?.filters.documents?.facets.lastmodified || [],
    location: searchOption?.filters.documents?.facets.location || [],
    pageCount: searchOption?.filters.documents?.facets.pageCount || [],
  },
});

export const getDocumentCategoriesWithSelection = (
  documentCategories: DocumentCategories,
  filterQuery: SearchQueryFull
): DocumentResultFacets => {
  const filterFacets = filterQuery.facets;

  return {
    ...getEmptyDocumentStateFacets(),
    ...Object.keys(documentCategories).reduce(
      (documentCategoriesWithSelection, field) => {
        if (field === 'fileCategory' || field === 'location') {
          return {
            ...documentCategoriesWithSelection,
            [field]: documentCategories[field].map((documentPayload) => {
              return {
                ...documentPayload,
                selected: filterFacets[field].includes(documentPayload.name),
              };
            }),
          };
        }
        if (field === 'labels') {
          return {
            ...documentCategoriesWithSelection,
            [field]: documentCategories[field].map((documentPayload) => {
              return {
                ...documentPayload,
                selected: !!filterFacets[field].find(
                  (label) => label.externalId === documentPayload.name
                ),
              };
            }),
          };
        }
        return {
          ...documentCategoriesWithSelection,
          [field]: get(documentCategories, field, []),
        };
      },
      {}
    ),
  };
};
