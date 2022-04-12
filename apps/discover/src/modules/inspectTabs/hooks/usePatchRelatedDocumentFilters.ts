import get from 'lodash/get';
import { documentValuesPayload } from 'services/documents/structure';
import { useQuerySavedSearchRelatedDocuments } from 'services/savedSearches/useSavedSearchQuery';
import { getEmptyGeometry } from 'utils/geometry';

import { DocumentsFacets } from 'modules/documentSearch/types';
import { useMutateRelatedDocumentPatch } from 'modules/wellSearch/selectors/relatedDocuments/hooks/useMutateRelatedDocumentPatch';

export const usePatchRelatedDocumentFilters = () => {
  const { mutate } = useMutateRelatedDocumentPatch();
  const { data } = useQuerySavedSearchRelatedDocuments();
  return (
    facets: Partial<DocumentsFacets>,
    query: string = get(data, 'query', '')
  ) => {
    const patchedFacets = {
      ...get(data, 'filters.documents.facets'),
      ...facets,
    };
    return mutate(
      documentValuesPayload(query, patchedFacets, getEmptyGeometry())
    );
  };
};
