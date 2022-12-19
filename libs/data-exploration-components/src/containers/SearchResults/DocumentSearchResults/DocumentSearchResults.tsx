import React, { useContext, useState } from 'react';
import styled from 'styled-components/macro';

import {
  SearchResultCountLabel,
  SearchResultToolbar,
} from '@data-exploration-components/containers/SearchResults';
import { DocumentsTable } from '@data-exploration-components/containers/Documents';
import { TableSortBy } from '@data-exploration-components/components/Table';
import {
  Document,
  InternalDocumentFilter,
  useDocumentSearchResultQuery,
} from '@data-exploration-components/domain/documents';
import { FileInfo } from '@cognite/sdk';
import { AppliedFiltersTags } from '@data-exploration-components/components/AppliedFiltersTags/AppliedFiltersTags';
import { UploadButton } from '@data-exploration-components/components/Buttons/UploadButton/UploadButton';
import { v4 as uuid } from 'uuid';
import { CLOSE_DROPDOWN_EVENT } from '@data-exploration-components/utils';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { AppContext } from '@data-exploration-components/context/AppContext';
import { DocumentUploaderModal } from '@data-exploration-components/containers/Documents/DocumentUploader/DocumentUploaderModal';

import { VerticalDivider } from '@data-exploration-components/components/Divider';
import { useDocumentFilteredAggregateCount } from '@data-exploration-components/domain/documents/service/queries/aggregates/useDocumentFilteredAggregateCount';
import { DATA_EXPLORATION_COMPONENT } from '@data-exploration-components/constants/metrics';
import { ResourceTypes } from '@data-exploration-components/types';

export interface DocumentSearchResultsProps {
  query?: string;
  filter: InternalDocumentFilter;
  onClick: (item: Document) => void;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
  onFileClicked?: (file: FileInfo) => boolean;
  selectedRow?: Record<string | number, boolean>;
  enableAdvancedFilters?: boolean;
}

export const DocumentSearchResults = ({
  enableAdvancedFilters,
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
    context?.flow! as any,
    'filesAcl',
    'WRITE',
    undefined,
    { enabled: !!context?.flow }
  );

  const resourceType = ResourceTypes.File;
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
              enableAdvancedFilters={enableAdvancedFilters}
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
                    isAdvanceFiltersEnabled: enableAdvancedFilters,
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
        onRowClick={(document) => {
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
          onFileSelected={(file) => {
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
