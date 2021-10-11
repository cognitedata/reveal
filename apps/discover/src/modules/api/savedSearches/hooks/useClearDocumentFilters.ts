import { documentFacetsStructure as emptyFacets } from 'modules/api/documents/structure';
import { useMutatePatchSavedSearch } from 'modules/api/savedSearches/useQuery';
import { DocumentsFacets } from 'modules/documentSearch/types';

export const useClearDocumentFilters = () => {
  const { mutateAsync } = useMutatePatchSavedSearch();
  return () => {
    return mutateAsync({ filters: { documents: { facets: emptyFacets } } });
  };
};

export const useSetDocumentFilters = () => {
  const { mutateAsync } = useMutatePatchSavedSearch();
  return (facets: DocumentsFacets) => {
    return mutateAsync({ filters: { documents: { facets } } });
  };
};
