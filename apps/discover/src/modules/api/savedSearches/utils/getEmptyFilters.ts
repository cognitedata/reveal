import { getEmptyFacets as getEmptyDocumentFacets } from 'modules/documentSearch/utils';

export const getEmptyFilters = () => {
  return {
    documents: {
      facets: getEmptyDocumentFacets(),
    },
    // -todo- add wells here:
  };
};
