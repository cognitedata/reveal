import React, { useContext, useState } from 'react';
import styled from 'styled-components/macro';

import {
  SearchResultCountLabel,
  SearchResultToolbar,
} from 'containers/SearchResults';
import { DocumentsTable } from 'containers/Documents';
import { TableSortBy } from 'components/Table';
import {
  Document,
  InternalDocumentFilter,
  useDocumentSearchResultQuery,
} from 'domain/documents';
import { FileInfo } from '@cognite/sdk';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';
import { UploadButton } from 'components/Buttons/UploadButton/UploadButton';
import { v4 as uuid } from 'uuid';
import { CLOSE_DROPDOWN_EVENT } from 'utils';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { AppContext } from 'context/AppContext';
import { DocumentUploaderModal } from 'containers/Documents/DocumentUploader/DocumentUploaderModal';

import { VerticalDivider } from 'components/Divider';
import { useDocumentFilteredAggregateCount } from 'domain/documents/service/queries/aggregates/useDocumentFilteredAggregateCount';
import { DATA_EXPLORATION_COMPONENT } from 'constants/metrics';
import { ResourceTypes } from 'types';

export interface DocumentSearchResultsProps {
  query?: string;
  filter: InternalDocumentFilter;
  onClick: (item: Document) => void;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
  onFileClicked?: (file: FileInfo) => boolean;
  selectedRow?: Record<string | number, boolean>;
}

// When using this component do not forget to wrap it with DocumentSearchProvider.
export const DocumentSearchResults = ({
  query = '',
  filter = {},
  onClick,
  selectedRow,
  onFilterChange,
  onFileClicked,
}: DocumentSearchResultsProps) => {
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { results, isLoading, fetchNextPage, hasNextPage } =
    useDocumentSearchResultQuery(
      { filter, query, sortBy },
      { keepPreviousData: true }
    );

  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const { data: aggregateCount = 0 } = useDocumentFilteredAggregateCount({
    query,
    filters: filter,
  });

  const context = useContext(AppContext);
  const { data: hasEditPermissions } = usePermissions(
    context?.flow!,
    'filesAcl',
    'WRITE',
    undefined,
    { enabled: !!context?.flow }
  );
  const resourceType = ResourceTypes.Document;
  const trackUsage = context?.trackUsage;

  return (
    <DocumentSearchResultWrapper>
      <DocumentsTable
        id="documents-search-results"
        enableSorting
        selectedRows={selectedRow}
        onSort={setSortBy}
        query={query}
        tableHeaders={
          <>
            <SearchResultToolbar
              type={resourceType}
              style={{ width: '100%' }}
              showCount={true}
              resultCount={
                <SearchResultCountLabel
                  loadedCount={results.length}
                  totalCount={aggregateCount}
                  resourceType={resourceType}
                />
              }
            />
            <UploadButton
              onClick={() => {
                setModalVisible(true);
                trackUsage &&
                  trackUsage(DATA_EXPLORATION_COMPONENT.CLICK.UPLOAD, {
                    table: resourceType,
                  });
              }}
              disabled={!hasEditPermissions}
            />
            <VerticalDivider />
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
