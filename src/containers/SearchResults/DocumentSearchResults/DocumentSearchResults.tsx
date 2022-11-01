import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { useDocumentSearch } from '@cognite/react-document-search';

import { SearchResultToolbar } from 'containers/SearchResults';
import { DocumentsTable } from 'containers/Documents';
import {
  Document,
  DocumentSort,
  InternalDocumentFilter,
  normalize,
  useObserveDocumentSearchFilters,
} from 'domain/documents';

export interface DocumentSearchResultsProps {
  query?: string;
  filter: InternalDocumentFilter;
  onClick: (item: Document) => void;
}

// When using this component do not forget to wrap it with DocumentSearchProvider.
export const DocumentSearchResults = ({
  query = '',
  filter,
  onClick,
}: DocumentSearchResultsProps) => {
  const [sortBy, setSortBy] = useState<DocumentSort[]>([]);
  const { results, isLoading, fetchNextPage, hasNextPage } =
    useDocumentSearch();

  useObserveDocumentSearchFilters(query, filter, sortBy);

  const normalizedDocuments = normalize(results);

  return (
    <DocumentSearchResultWrapper>
      <DocumentsTable
        id="documents-search-results"
        enableSorting
        onSort={props => {
          if (props !== undefined && props.length > 0) {
            const { id: columnName, desc } = props[0];
            setSortBy([{ column: columnName, order: desc ? 'desc' : 'asc' }]);
          } else {
            setSortBy([]);
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
