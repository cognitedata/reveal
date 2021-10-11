import {
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
  filetype: [],
  labels: [],
  lastcreated: [],
  location: [],
  lastUpdatedTime: [],
});

export const getEmptyFacets = (): DocumentsFacets => ({
  filetype: [],
  labels: [],
  lastmodified: [],
  lastcreated: [],
  location: [],
});

export const getFacets = (
  facets: Partial<DocumentsFacets> = {}
): DocumentsFacets => ({
  ...getEmptyFacets(),
  ...facets,
});
