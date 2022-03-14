import flatten from 'lodash/flatten';

import {
  DocumentsFacets,
  DocumentQueryFacetsNames,
  DocumentFilterCategoryTitles,
  DocumentFacet,
} from 'modules/documentSearch/types';

const RANGE_FACETS: DocumentFacet[] = [
  'lastcreated',
  'lastmodified',
  'pageCount',
];

export const getDocumentCategoryTitle = (
  category: DocumentQueryFacetsNames
) => {
  return DocumentFilterCategoryTitles[category] || '';
};

export const isDocumentDateFacet = (facet: DocumentFacet): boolean =>
  facet === 'lastmodified' || facet === 'lastcreated';

export const isRangeFacet = (facet: DocumentFacet): boolean =>
  RANGE_FACETS.includes(facet);

export const getDocumentFacetsflatValues = (
  documentFacets: DocumentsFacets
) => {
  const result = Object.values(documentFacets);
  return flatten<string | { externalId: string }[]>(result);
};
