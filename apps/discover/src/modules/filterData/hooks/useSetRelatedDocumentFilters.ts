import { getEmptyGeometry } from '_helpers/geometry';
import { documentValuesPayload } from 'modules/api/documents/structure';
import { DocumentsFacets } from 'modules/documentSearch/types';
import { useMutateRelatedDocumentPatch } from 'modules/wellSearch/selectors/sequence/RelatedDocuments/RelatedDocumentUseQuery';

export const useSetRelatedDocumentFilters = () => {
  const { mutate } = useMutateRelatedDocumentPatch();
  return (facets: DocumentsFacets, query: string) => {
    return mutate(documentValuesPayload(query, facets, getEmptyGeometry()));
  };
};
