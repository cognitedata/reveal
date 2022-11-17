import React, { useState } from 'react';
import styled from 'styled-components/macro';

import { SearchResultToolbar } from 'containers/SearchResults';
import { DocumentsTable } from 'containers/Documents';
import { TableSortBy } from 'components/Table';
import {
  Document,
  InternalDocumentFilter,
  useDocumentSearchQuery,
  useObserveDocumentSearchFilters,
} from 'domain/documents';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';

export interface DocumentSearchResultsProps {
  query?: string;
  filter: InternalDocumentFilter;
  onClick: (item: Document) => void;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
}

// When using this component do not forget to wrap it with DocumentSearchProvider.
export const DocumentSearchResults = ({
  query = '',
  filter = {},
  onClick,
  onFilterChange,
}: DocumentSearchResultsProps) => {
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { results, isLoading, fetchNextPage, hasNextPage } =
    useDocumentSearchQuery();

  useObserveDocumentSearchFilters(query, filter, sortBy);

  return (
    <DocumentSearchResultWrapper>
      <DocumentsTable
        id="documents-search-results"
        enableSorting
        onSort={setSortBy}
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
        sorting={sortBy}
        tableSubHeaders={
          <AppliedFiltersTags
            filter={filter}
            onFilterChange={onFilterChange}
            icon="Document"
          />
        }
        data={results}
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
