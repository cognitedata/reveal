import React from 'react';
import { useDispatch } from 'react-redux';

import isEmpty from 'lodash/isEmpty';
import styled from 'styled-components/macro';

import { documentSearchActions } from 'modules/documentSearch/actions';
import { useDocumentResultCount } from 'modules/documentSearch/hooks/useDocumentResultCount';
import { useDocumentSearchResultQuery } from 'modules/documentSearch/hooks/useDocumentSearchResultQuery';
import {
  useLabels,
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

export const DocumentSearchContent: React.FC = () => {
  const {
    data: { facets, hits },
    isLoading,
  } = useDocumentSearchResultQuery();

  const dispatch = useDispatch();
  const selectedDocumentIds = useSelectedDocumentsDocId();

  const handleDeselectAll = () => {
    dispatch(documentSearchActions.removeAllDocumentIds());
    // dispatch(documentSearchActions.setPreviewedEntities([]));
  };

  const labels = useLabels();

  const documentResultCount = useDocumentResultCount();

  const documentInformation = getDocumentsFacetsInfo(facets, labels);

  const searchHasFoundResults = !isEmpty(hits) && !isLoading;

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
