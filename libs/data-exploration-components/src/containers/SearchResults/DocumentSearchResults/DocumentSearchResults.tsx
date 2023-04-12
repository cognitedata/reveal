import React, { useContext, useState } from 'react';
import styled from 'styled-components/macro';

import {
  SearchResultCountLabel,
  SearchResultToolbar,
} from '@data-exploration-components/containers/SearchResults';
import { DocumentsTable } from '@data-exploration-components/containers/Documents';
import {
  InternalDocument,
  TableSortBy,
  useDocumentSearchResultWithMatchingLabelsQuery,
} from '@data-exploration-lib/domain-layer';
import { Asset, FileInfo } from '@cognite/sdk';
import { AppliedFiltersTags } from '@data-exploration-components/components/AppliedFiltersTags/AppliedFiltersTags';
import { UploadButton } from '@data-exploration-components/components/Buttons/UploadButton/UploadButton';
import { CLOSE_DROPDOWN_EVENT } from '@data-exploration-components/utils';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { AppContext } from '@data-exploration-lib/core';
import { DocumentUploaderModal } from '@data-exploration-components/containers/Documents/DocumentUploader/DocumentUploaderModal';

import { VerticalDivider } from '@data-exploration-components/components/Divider';
import { useDocumentFilteredAggregateCount } from '@data-exploration-lib/domain-layer';
import { DATA_EXPLORATION_COMPONENT } from '@data-exploration-lib/core';
import { ResourceTypes } from '@data-exploration-components/types';
import {
  InternalDocumentFilter,
  useGetSearchConfigFromLocalStorage,
} from '@data-exploration-lib/core';

export interface DocumentSearchResultsProps {
  query?: string;
  filter: InternalDocumentFilter;
  onClick: (item: InternalDocument) => void;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
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
  onRootAssetClick,
  selectedRow,
  onFilterChange,
  onFileClicked,
}: DocumentSearchResultsProps) => {
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const documentSearchConfig = useGetSearchConfigFromLocalStorage('file');
  const { results, isLoading, fetchNextPage, hasNextPage } =
    useDocumentSearchResultWithMatchingLabelsQuery(
      { filter, query: undefined, sortBy },
      { keepPreviousData: true },
      documentSearchConfig
    );

  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const { data: aggregateCount = 0 } = useDocumentFilteredAggregateCount(
    {
      query,
      filters: filter,
    },
    documentSearchConfig
  );

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
        onRootAssetClick={onRootAssetClick}
        showLoadButton
        fetchMore={() => {
          fetchNextPage();
        }}
        hasNextPage={hasNextPage}
        isLoadingMore={isLoading}
      />
      {modalVisible && (
        <DocumentUploaderModal
          key="document-uploader-modal"
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
