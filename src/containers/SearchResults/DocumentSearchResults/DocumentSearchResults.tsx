import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { useDocumentSearch } from '@cognite/react-document-search';

import { SearchResultToolbar } from 'containers/SearchResults';
import { DocumentsTable } from 'containers/Documents';
import { Document, normalize } from 'domain/documents';
import { useObserveDocumentSearchFilters } from 'domain/documents/internal/hook/useObserveDocumentSearchFilters';
export interface DocumentSearchResultsProps {
  query?: string;
  filter: Record<string, unknown>;
  onClick: (item: Document) => void;
}

// When using this component do not forget to wrap it with DocumentSearchProvider.
export const DocumentSearchResults = ({
  query = '',
  filter,
  onClick,
}: DocumentSearchResultsProps) => {
  const [sortBy, setSortBy] = useState({});
  const { results, isLoading, fetchNextPage, hasNextPage } =
    useDocumentSearch();

  useObserveDocumentSearchFilters(query, filter, sortBy);

  const normalizedDocuments = normalize(results);

  return (
    <DocumentSearchResultWrapper>
      <DocumentsTable
        isSortingEnabled
        onSort={props => {
          const { sortBy } = props;
          if (sortBy !== undefined && sortBy.length > 0) {
            const { id: columnName, desc } = sortBy[0];
            setSortBy({ column: columnName, order: desc ? 'desc' : 'asc' });
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
