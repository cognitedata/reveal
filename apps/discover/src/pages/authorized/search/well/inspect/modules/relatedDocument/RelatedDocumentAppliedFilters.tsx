import React from 'react';

import { useDocumentResultRelatedCount } from 'modules/documentSearch/hooks/useDocumentResultRelatedCount';
import { DocumentsFacets } from 'modules/documentSearch/types';
import { getEmptyFacets } from 'modules/documentSearch/utils';
import { useSetRelatedDocumentsFilters } from 'modules/inspectTabs/hooks/useSetRelatedDocumentsFilters';
import { useAppliedMapGeoJsonFilters } from 'modules/sidebar/selectors';
import { useRelatedDocumentFilterQuery } from 'modules/wellSearch/selectors/relatedDocuments/hooks/useRelatedDocumentFilterQuery';
import { DocumentAppliedFiltersCore } from 'pages/authorized/search/document/header/DocumentAppliedFilters';

interface Props {
  showSearchPhraseTag?: boolean;
  showClearTag?: boolean;
}
// Show applied filters when result count is > 0 (otherwise it should be showing empty state)
export const RelatedDocumentAppliedFilters: React.FC<Props> = (props) => {
  const { facets, phrase } = useRelatedDocumentFilterQuery();
  const extraGeoJsonFilters = useAppliedMapGeoJsonFilters();
  const setRelatedDocumentFilters = useSetRelatedDocumentsFilters();
  const documentResultCount = useDocumentResultRelatedCount();

  if (documentResultCount === 0) {
    return null;
  }

  const setDocumentFilters = (docFacets: DocumentsFacets) => {
    setRelatedDocumentFilters(docFacets);
  };
  const clearAllDocumentFilters = () => {
    setRelatedDocumentFilters(getEmptyFacets(), '');
  };
  const clearQuery = () => {
    setRelatedDocumentFilters({}, '');
  };

  const actions = {
    setDocumentFilters,
    clearAllDocumentFilters,
    clearQuery,
  };

  const data = {
    documentFacets: facets,
    extraGeoJsonFilters,
    searchPhrase: phrase,
  };

  return (
    <DocumentAppliedFiltersCore {...props} data={data} actions={actions} />
  );
};
