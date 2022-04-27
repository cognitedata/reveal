import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import isEmpty from 'lodash/isEmpty';
import { useDocumentSearchResultQuery } from 'services/documentSearch/useDocumentSearchResultQuery';
import { useLabelsQuery } from 'services/labels/useLabelsQuery';
import styled from 'styled-components/macro';

import { documentSearchActions } from 'modules/documentSearch/actions';
import { useDocumentResultCount } from 'modules/documentSearch/hooks/useDocumentResultCount';
import { useSelectedDocumentIds } from 'modules/documentSearch/selectors';
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

const MaxHeight = styled(FlexColumn)`
  height: 100%;
  max-height: 100%;
`;

export const DocumentSearchContent: React.FC = () => {
  const {
    data: { facets, hits },
    isLoading,
  } = useDocumentSearchResultQuery();

  const dispatch = useDispatch();
  const selectedDocumentIds = useSelectedDocumentIds();

  const handleDeselectAll = useCallback(() => {
    dispatch(documentSearchActions.unselectDocumentIds(selectedDocumentIds));
  }, [dispatch, selectedDocumentIds]);

  const labels = useLabelsQuery();

  const documentResultCount = useDocumentResultCount();

  const documentInformation = getDocumentsFacetsInfo(facets, labels);

  const searchHasFoundResults = !isEmpty(hits) && !isLoading;

  // To memo, or not to memo, thats the question...
  const documentStats: BreadCrumbStats[] = [
    {
      label: 'Documents',
      totalResults: documentResultCount,
      currentHits: hits.length,
      info: documentInformation,
    },
  ];

  const renderResults = () => (
    <>
      <SearchTableResultActionContainer>
        <MaxHeight>
          <SearchBreadcrumb stats={documentStats} />
          <DocumentContentAppliedFilters />
        </MaxHeight>

        <SearchDisplayOptionPanel />
      </SearchTableResultActionContainer>

      <DocumentResultTable />
      <DocumentsBulkActions
        selectedDocumentIds={selectedDocumentIds.map(Number)}
        handleDeselectAll={handleDeselectAll}
      />
    </>
  );

  return (
    <MaxHeight>
      {searchHasFoundResults ? (
        renderResults()
      ) : (
        <NoResults isLoading={isLoading} />
      )}
    </MaxHeight>
  );
};

export default React.memo(DocumentSearchContent);
