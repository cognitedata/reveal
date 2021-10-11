import React from 'react';

import FeedbackPanel from 'components/modals/entity-feedback';
import { useClearDocumentFilters } from 'modules/api/savedSearches/hooks/useClearDocumentFilters';
import {
  useCurrentDocumentQuery,
  useDocuments,
} from 'modules/documentSearch/selectors';

import { SearchWrapper } from '../elements';

import DocumentSearchContent from './results';

export const DocumentSearch: React.FC = () => {
  const currentDocumentQuery = useCurrentDocumentQuery();
  const clearDocumentFilters = useClearDocumentFilters();

  const { result, isSearching } = useDocuments();

  /**
   * This block is triggered when no any document filters have been applied or anything is not searched in documents.
   * This prevents the blank results screen in the above case. (PP-1267)
   * Clear document filters and load the results set.
   */
  React.useEffect(() => {
    if (!isSearching && !currentDocumentQuery.hasSearched) {
      clearDocumentFilters();
    }
  }, [isSearching, currentDocumentQuery.hasSearched]);

  return (
    <>
      <SearchWrapper>
        <DocumentSearchContent
          hasResults={result.hits && result.hits.length > 0}
        />
      </SearchWrapper>

      <FeedbackPanel />
    </>
  );
};

export default DocumentSearch;
