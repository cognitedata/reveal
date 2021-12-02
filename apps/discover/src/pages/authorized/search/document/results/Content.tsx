import React from 'react';
import { useDispatch } from 'react-redux';

import styled from 'styled-components/macro';

import { documentSearchActions } from 'modules/documentSearch/actions';
import { useDocumentResultCount } from 'modules/documentSearch/hooks/useDocumentResultCount';
import {
  useLabels,
  useDocuments,
  useSelectedDocumentsDocId,
} from 'modules/documentSearch/selectors';
import { getDocumentsFacetsInfo } from 'modules/documentSearch/utils';
import { SearchBreadcrumb } from 'pages/authorized/search/common/searchResult';
import { DocumentContentAppliedFilters } from 'pages/authorized/search/document/header/DocumentContentAppliedFilters';
import SearchDisplayOptionPanel from 'pages/authorized/search/document/header/options';
import { SearchTableResultActionContainer } from 'pages/authorized/search/elements';
import { FlexColumn } from 'styles/layout';

import { BreadCrumbStats } from '../../common/searchResult/types';
import { NoResults } from '../NoResults';

import { DocumentResultTable } from './DocumentResultTable';
import { DocumentsBulkActions } from './DocumentsBulkActions';

const SearchResults = styled(FlexColumn)`
  height: 100%;
  max-height: 100%;
`;

interface Props {
  hasResults: boolean;
}
export const DocumentSearchContent: React.FC<Props> = ({ hasResults }) => {
  const {
    result: { facets, hits },
  } = useDocuments();
  const dispatch = useDispatch();
  const selectedDocumentIds = useSelectedDocumentsDocId();

  const handleDeselectAll = () => {
    dispatch(documentSearchActions.removeAllDocumentIds());
    // dispatch(documentSearchActions.setPreviewedEntities([]));
  };

  const labels = useLabels();

  const { isLoading } = useDocuments();

  const documentResultCount = useDocumentResultCount();

  const searchHasFoundResults = hasResults && !isLoading;

  const documentInformation = getDocumentsFacetsInfo(facets, labels);

  // To memo, or not to memo, thats the question...
  const documentStats: BreadCrumbStats = {
    totalResults: documentResultCount,
    currentHits: hits.length,
  };

  const renderResults = () => (
    <>
      <SearchTableResultActionContainer>
        <FlexColumn>
          <SearchBreadcrumb
            content={documentInformation}
            stats={documentStats}
          />
          <DocumentContentAppliedFilters />
        </FlexColumn>

        <SearchDisplayOptionPanel />
      </SearchTableResultActionContainer>

      <DocumentResultTable />
      <DocumentsBulkActions
        selectedDocumentIds={selectedDocumentIds}
        handleDeselectAll={handleDeselectAll}
      />
    </>
  );

  return (
    <SearchResults>
      {searchHasFoundResults ? (
        renderResults()
      ) : (
        <NoResults isLoading={isLoading} />
      )}
    </SearchResults>
  );
};

export default React.memo(DocumentSearchContent);
