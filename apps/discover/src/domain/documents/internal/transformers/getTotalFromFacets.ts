import { DocumentResultFacets } from 'modules/documentSearch/types';

export const getTotalFromFacets = (facets: DocumentResultFacets) => {
  return facets.total.reduce((result, value) => {
    return result + value.count;
  }, 0);
};
