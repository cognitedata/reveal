import get from 'lodash/get';
import { getEmptyGeometry } from 'utils/geometry';

import { documentValuesPayload } from 'modules/api/documents/structure';
import { useQuerySavedSearchRelatedDocuments } from 'modules/api/savedSearches/useSavedSearchQuery';
import { DocumentsFacets } from 'modules/documentSearch/types';
import { useMutateRelatedDocumentPatch } from 'modules/wellSearch/selectors/sequence/RelatedDocuments/RelatedDocumentUseQuery';

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
