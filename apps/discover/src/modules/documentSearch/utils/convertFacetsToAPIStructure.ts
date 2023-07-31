import { DocumentsFacets } from 'modules/documentSearch/types';

export const convertFacetsToAPIStructure = (facets: DocumentsFacets) => {
  return {
    ...facets,
    labels: facets.labels || [],
  };
};
