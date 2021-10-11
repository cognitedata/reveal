import { useDocumentCategoryQuery } from 'modules/api/documents/useDocumentQuery';
import { useLastChangedDocumentFilterFacetKey } from 'modules/documentSearch/hooks/useLastChangedDocumentFilterFacetKey';
import {
  useDocumentResultCount,
  useFacets,
  useIsolatedDocumentResultFacets,
} from 'modules/documentSearch/selectors';
import { DocumentResultFacets } from 'modules/documentSearch/types';
import { getEmptyDocumentStateFacets } from 'modules/documentSearch/utils';
import {
  mapDocumentCategoryToDocumentResultFacets,
  patchDocumentPayloadCount,
} from 'modules/documentSearch/utils/availableDocumentResultsCount';
import { useAppliedDocumentFiltersFacetsKeys } from 'modules/sidebar/hooks/useAppliedDocumentFiltersFacetsKeys';

export const useDocumentPayloadWithAvailableResultsCount = () => {
  const { data } = useDocumentCategoryQuery();
  const facetsState = useFacets();
  const documentResultCount = useDocumentResultCount();
  const IsolatedDocumentResultFacets = useIsolatedDocumentResultFacets();
  const appliedDocumentFiltersFacetsKeys =
    useAppliedDocumentFiltersFacetsKeys();
  const lastChangedDocumentFilterFacetKey =
    useLastChangedDocumentFilterFacetKey();

  const documentStateFacets =
    !data || 'error' in data
      ? getEmptyDocumentStateFacets()
      : mapDocumentCategoryToDocumentResultFacets(data);

  return (facetsStateKey: keyof DocumentResultFacets) => {
    const currentFacets = documentStateFacets[facetsStateKey];
    const updatedFacets = facetsState[facetsStateKey];
    const isolatedFacets = IsolatedDocumentResultFacets[facetsStateKey];

    const isolatedFacetsWithUpdatedFacets = patchDocumentPayloadCount(
      isolatedFacets,
      updatedFacets,
      true
    );

    const shouldUseIsolatedFacetsWithUpdatedFacets =
      !!documentResultCount &&
      appliedDocumentFiltersFacetsKeys.includes(facetsStateKey);

    const facetsPatchContent = shouldUseIsolatedFacetsWithUpdatedFacets
      ? isolatedFacetsWithUpdatedFacets
      : updatedFacets;

    const shouldUseCurrentItemCount =
      !!documentResultCount &&
      lastChangedDocumentFilterFacetKey === facetsStateKey;

    return patchDocumentPayloadCount(
      currentFacets,
      facetsPatchContent,
      shouldUseCurrentItemCount
    );
  };
};
