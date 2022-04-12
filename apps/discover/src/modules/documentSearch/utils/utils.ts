import { DocumentCategories } from '@cognite/discover-api-types';

import {
  DocumentResult,
  DocumentResultFacets,
  DocumentsFacets,
} from 'modules/documentSearch/types';

//
// ----
//
//  NOTE - slowly start to split the bigger functions out here into files
//
// ----
//

type Refinement = 'OR' | 'EXACT';
export const addQueryRefinement = (field: string, refinement: Refinement) => {
  if (refinement === 'OR') {
    return `(${field.trim()})`;
  }
  if (refinement === 'EXACT') {
    return `'${field.trim()}'`;
  }

  return field;
};

export const getEmptyDocumentStateFacets = (): DocumentResultFacets => ({
  fileCategory: [],
  labels: [],
  lastcreated: [],
  location: [],
  total: [],
  pageCount: [],
});

export const getEmptyDocumentResult = (): DocumentResult => ({
  count: 0,
  hits: [],
  facets: getEmptyDocumentStateFacets(),
});

export const getEmptyFacets = (): DocumentsFacets => ({
  fileCategory: [],
  labels: [],
  lastmodified: [],
  lastcreated: [],
  location: [],
  pageCount: [],
});

export const getFacets = (
  facets: Partial<DocumentsFacets> = {}
): DocumentsFacets => ({
  ...getEmptyFacets(),
  ...facets,
});

export const getEmptyDocumentCategories = (): DocumentCategories => ({
  documentType: [],
  fileCategory: [],
  fileType: [],
  labels: [],
  location: [],
  pageCount: [],
});
