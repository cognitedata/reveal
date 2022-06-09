import { documentValuesPayload } from 'domain/documents/utils/documentValuesPayload';
import { useRelatedDocumentPatchMutate } from 'domain/savedSearches/internal/actions/useRelatedDocumentPatchMutate';
import { useQuerySavedSearchRelatedDocuments } from 'domain/savedSearches/internal/queries/useQuerySavedSearchRelatedDocuments';

import get from 'lodash/get';
import { getEmptyGeometry } from 'utils/geometry';

import { DocumentsFacets } from 'modules/documentSearch/types';

export const usePatchRelatedDocumentFilters = () => {
  const { mutate } = useRelatedDocumentPatchMutate();
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
