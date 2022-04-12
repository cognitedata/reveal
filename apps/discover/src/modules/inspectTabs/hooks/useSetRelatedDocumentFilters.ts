import { documentValuesPayload } from 'services/documents/structure';
import { getEmptyGeometry } from 'utils/geometry';

import { DocumentsFacets } from 'modules/documentSearch/types';
import { useMutateRelatedDocumentPatch } from 'modules/wellSearch/selectors/relatedDocuments/hooks/useMutateRelatedDocumentPatch';

export const useSetRelatedDocumentFilters = () => {
  const { mutate } = useMutateRelatedDocumentPatch();
  return (facets: DocumentsFacets, query: string) => {
    return mutate(documentValuesPayload(query, facets, getEmptyGeometry()));
  };
};
