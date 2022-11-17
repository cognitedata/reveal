import React, { useContext, useState } from 'react';
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
import { UploadButton } from 'components/Buttons/UploadButton/UploadButton';
import { v4 as uuid } from 'uuid';
import { FileInfo } from '@cognite/sdk';
import { CLOSE_DROPDOWN_EVENT } from 'utils';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { AppContext } from 'context/AppContext';
import { DocumentUploaderModal } from 'containers/Documents/DocumentUploader/DocumentUploaderModal';

export interface DocumentSearchResultsProps {
  query?: string;
  filter: InternalDocumentFilter;
  onClick: (item: Document) => void;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
  onFileClicked?: (file: FileInfo) => boolean;
}

// When using this component do not forget to wrap it with DocumentSearchProvider.
export const DocumentSearchResults = ({
  query = '',
  filter = {},
  onClick,
  onFilterChange,
  onFileClicked,
}: DocumentSearchResultsProps) => {
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { results, isLoading, fetchNextPage, hasNextPage } =
    useDocumentSearchQuery();
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);

  useObserveDocumentSearchFilters(query, filter, sortBy);

  const context = useContext(AppContext);
  const { data: hasEditPermissions } = usePermissions(
    context?.flow!,
    'filesAcl',
    'WRITE',
    undefined,
    { enabled: !!context?.flow }
  );

  return (
    <DocumentSearchResultWrapper>
      <DocumentsTable
        id="documents-search-results"
        enableSorting
        onSort={setSortBy}
        query={query}
        tableHeaders={
          <>
            <SearchResultToolbar
              showCount={true}
              api={query.length > 0 ? 'search' : 'list'}
              type="document"
              filter={filter}
              query={query}
              style={{ width: '100%' }}
            />
            <UploadButton
              onClick={() => {
                setModalVisible(true);
              }}
              disabled={!hasEditPermissions}
            />
          </>
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
      {modalVisible && (
        <DocumentUploaderModal
          key={uuid()}
          visible={modalVisible}
          onFileSelected={file => {
            if (onFileClicked) {
              if (!onFileClicked(file)) {
                return;
              }
            }
            setModalVisible(false);
            window.dispatchEvent(new Event(CLOSE_DROPDOWN_EVENT));
          }}
          onCancel={() => setModalVisible(false)}
        />
      )}
    </DocumentSearchResultWrapper>
  );
};

const DocumentSearchResultWrapper = styled.div`
  height: 100%;
`;
