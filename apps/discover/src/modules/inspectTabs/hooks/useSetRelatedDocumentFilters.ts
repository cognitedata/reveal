import { documentValuesPayload } from 'services/documents/structure';
import { useMutateRelatedDocumentPatch } from 'services/savedSearches/queries/useMutateRelatedDocumentPatch';
import { getEmptyGeometry } from 'utils/geometry';

import { DocumentsFacets } from 'modules/documentSearch/types';

export const useSetRelatedDocumentFilters = () => {
  const { mutate } = useMutateRelatedDocumentPatch();
  return (facets: DocumentsFacets, query: string) => {
    return mutate(documentValuesPayload(query, facets, getEmptyGeometry()));
  };
};
