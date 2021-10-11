import filter from 'lodash/filter';
import flatten from 'lodash/flatten';

import {
  DocumentsFacets,
  DocumentQueryFacetsNames,
  DocumentFilterCategoryTitles,
} from 'modules/documentSearch/types';

export const getDocumentCategoryTitle = (
  category: DocumentQueryFacetsNames
) => {
  return DocumentFilterCategoryTitles[category] || '';
};

export const isDocumentDateFacet = (facet: keyof DocumentsFacets): boolean =>
  facet === 'lastmodified' || facet === 'lastcreated';

export const getDocumentFacetsflatValues = (
  documentFacets: DocumentsFacets
) => {
  const result = Object.values(documentFacets);
  return flatten<string | { externalId: string }[]>(result);
};

export const removeAppliedDocumentFilterFromCategory = (
  item: string,
  categoryId: number | string,
  filters: DocumentsFacets
) => {
  const id = categoryId as keyof DocumentsFacets;
  return filter(filters[id], (value) =>
    id === 'labels'
      ? (value as { externalId: string }).externalId
      : value !== item
  );
};
