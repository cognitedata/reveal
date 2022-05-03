import * as React from 'react';

import isEmpty from 'lodash/isEmpty';
import { useDocumentSearchResultQuery } from 'services/documentSearch/queries/useDocumentSearchResultQuery';
import styled from 'styled-components/macro';

import { DocumentContentAppliedFilters } from 'pages/authorized/search/document/header/DocumentContentAppliedFilters';
import SearchDisplayOptionPanel from 'pages/authorized/search/document/header/options';
import { SearchTableResultActionContainer } from 'pages/authorized/search/elements';
import { FlexColumn } from 'styles/layout';

import { NoResults } from '../NoResults';

import { DocumentResultTable } from './DocumentResultTable';
import { DocumentsSearchResultsBulkActions } from './DocumentsSearchResultsBulkActions';
import { DocumentStats } from './DocumentStats';

// perhaps this should be generic somewhere
const MaxHeight = styled(FlexColumn)`
  height: 100%;
  max-height: 100%;
`;

export const DocumentSearchContent: React.FC = () => {
  const { results, isLoading } = useDocumentSearchResultQuery();

  const hasResults = !isEmpty(results?.hits) && !isLoading;

  if (hasResults) {
    return (
      <MaxHeight>
        <SearchTableResultActionContainer>
          <MaxHeight>
            <DocumentStats />
            <DocumentContentAppliedFilters />
          </MaxHeight>

          <SearchDisplayOptionPanel />
        </SearchTableResultActionContainer>

        <DocumentResultTable />
        <DocumentsSearchResultsBulkActions />
      </MaxHeight>
    );
  }

  return (
    <MaxHeight>
      <NoResults isLoading={isLoading} />
    </MaxHeight>
  );
};

export default React.memo(DocumentSearchContent);
