import { documentValuesPayload } from 'domain/documents/utils/documentValuesPayload';
import { useRelatedDocumentPatchMutate } from 'domain/savedSearches/internal/actions/useRelatedDocumentPatchMutate';

import { getEmptyGeometry } from 'utils/geometry';

import { DocumentsFacets } from 'modules/documentSearch/types';

export const useSetRelatedDocumentFilters = () => {
  const { mutate } = useRelatedDocumentPatchMutate();
  return (facets: DocumentsFacets, query: string) => {
    return mutate(documentValuesPayload(query, facets, getEmptyGeometry()));
  };
};
