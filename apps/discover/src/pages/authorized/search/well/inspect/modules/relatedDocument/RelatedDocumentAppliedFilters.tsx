import React from 'react';

import { BlueFilterTag } from 'components/tag/BlueFilterTag';
import { ClearTag } from 'components/tag/ClearTag';
import { DocumentsFacets } from 'modules/documentSearch/types';
import { getEmptyFacets } from 'modules/documentSearch/utils';
import { useSetRelatedDocumentFilters } from 'modules/filterData/hooks/useSetRelatedDocumentFilters';
import { useRelatedDocumentFilterQuery } from 'modules/wellSearch/selectors/sequence/RelatedDocuments/useRelatedDocumentFilterQuery';
import { DocumentAppliedFiltersCore } from 'pages/authorized/search/document/header/DocumentAppliedFilters';

interface Props {
  showSearchPhraseTag?: boolean;
  showClearTag?: boolean;
}

export const RelatedDocumentAppliedFilters: React.FC<Props> = (props) => {
  const { facets, phrase } = useRelatedDocumentFilterQuery();
  const setRelatedDocumentFilters = useSetRelatedDocumentFilters();

  const setDocumentFilters = (docFacets: DocumentsFacets) => {
    setRelatedDocumentFilters(docFacets, phrase);
  };
  const clearAllDocumentFilters = () => {
    setRelatedDocumentFilters(getEmptyFacets(), '');
  };
  const clearQuery = () => {
    setRelatedDocumentFilters(facets, '');
  };

  const actions = {
    setDocumentFilters,
    clearAllDocumentFilters,
    clearQuery,
  };
  const data = {
    documentFacets: facets,
    searchPhrase: phrase,
  };
  return (
    <DocumentAppliedFiltersCore
      filterTagComponent={BlueFilterTag}
      clearTagComponent={ClearTag}
      {...props}
      data={data}
      actions={actions}
    />
  );
};
