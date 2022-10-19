import React from 'react';
import styled from 'styled-components/macro';
import { useDocumentSearch } from '@cognite/react-document-search';

import { SearchResultToolbar } from 'containers/SearchResults';
import { DocumentsTable } from 'containers/Documents';
import { Document, normalize } from 'domain/documents';
export interface DocumentSearchResultsProps {
  query?: string;
  filter: object;
  onClick: (item: Document) => void;
  onSortClicked: (column: string, desc?: boolean) => void;
}

// When using this component do not forget to wrap it with DocumentSearchProvider.
export const DocumentSearchResults = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  query = '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filter = {},
  onClick,
  onSortClicked,
}: DocumentSearchResultsProps) => {
  const { results, isLoading, fetchNextPage, hasNextPage } =
    useDocumentSearch();

  const normalizedDocuments = normalize(results);

  return (
    <DocumentSearchResultWrapper>
      <DocumentsTable
        isSortingEnabled
        onSort={props => {
          const { sortBy } = props;
          if (sortBy !== undefined && sortBy.length > 0) {
            const { id: columnName, desc } = sortBy[0];
            onSortClicked(columnName, desc);
          }
        }}
        query={query}
        tableHeaders={
          <SearchResultToolbar
            showCount={true}
            api={query.length > 0 ? 'search' : 'list'}
            type="document"
            filter={filter}
            query={query}
          />
        }
        data={normalizedDocuments}
        onRowClick={document => {
          if (document !== undefined) {
            onClick(document);
          }
        }}
        showLoadButton
        fetchMore={() => {
          fetchNextPage();
        }}
        hasNextPage={hasNextPage}
        isLoadingMore={isLoading}
      />
    </DocumentSearchResultWrapper>
  );
};

const DocumentSearchResultWrapper = styled.div`
  height: 100%;
`;
