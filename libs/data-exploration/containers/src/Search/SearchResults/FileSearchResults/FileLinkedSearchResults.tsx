import React, { useMemo, useState } from 'react';

import { DefaultPreviewFilter } from '@data-exploration/components';
import { useDebounce } from 'use-debounce';

import { FileInfo } from '@cognite/sdk';

import {
  convertResourceType,
  InternalCommonFilters,
  InternalDocumentFilter,
  InternalFilesFilters,
} from '@data-exploration-lib/core';
import {
  InternalDocument,
  TableSortBy,
  useDocumentSearchResultQuery,
} from '@data-exploration-lib/domain-layer';

import {
  AppliedFiltersTags,
  DocumentsTable,
  FileGroupingTable,
  useResourceResults,
  OldFileGroupTable,
} from '../../../index';

import {
  GroupingTableHeader,
  GroupingTableContainer,
  GroupingTableWrapper,
} from './elements';
import { FileTable } from './FileTable';
import {
  FileTableFiltersDocument,
  FileTableFiltersFile,
} from './FileTableFilters';
import { FileViewSwitcher } from './FileViewSwitcher';

interface Props {
  defaultFilter: InternalCommonFilters;
  isGroupingFilesEnabled?: boolean;
  onClick: (item: FileInfo | InternalDocument) => void;
  onParentAssetClick: (assetId: number) => void;
  isDocumentsApiEnabled?: boolean;
}

export const FileLinkedSearchResults: React.FC<Props> = ({
  defaultFilter,
  isGroupingFilesEnabled,
  onClick,
  onParentAssetClick,
  isDocumentsApiEnabled = true,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [documentFilter, setDocumentFilter] = useState<InternalDocumentFilter>(
    {}
  );
  const [fileFilter, setFileFilter] = useState<InternalFilesFilters>({});
  const [currentView, setCurrentView] = useState<string>(
    isGroupingFilesEnabled ? 'tree' : 'list'
  );
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const documentFilters = useMemo(() => {
    return {
      ...documentFilter,
      ...defaultFilter,
    };
  }, [documentFilter, defaultFilter]);

  const fileFilters = useMemo(() => {
    return {
      ...fileFilter,
      ...defaultFilter,
    };
  }, [fileFilter, defaultFilter]);

  const {
    fetchNextPage,
    results: items,
    hasNextPage,
    isLoading: isDocumentsLoading,
  } = useDocumentSearchResultQuery(
    {
      filter: documentFilters,
      query: debouncedQuery,
      sortBy,
      limit: 1000,
    },
    { enabled: isDocumentsApiEnabled }
  );

  const appliedDocumentFilters = {
    ...documentFilter,
    assetSubtreeIds: undefined,
  };
  const appliedFileFilter = { ...fileFilter, assetSubtreeIds: undefined };

  const handleDocumentFilterChange = (newValue: InternalDocumentFilter) => {
    setDocumentFilter((prevState) => ({ ...prevState, ...newValue }));
  };
  const handleFileFilterChange = (newValue: InternalFilesFilters) => {
    setFileFilter((prevState) => ({ ...prevState, ...newValue }));
  };

  const api = convertResourceType('file');
  const {
    canFetchMore,
    fetchMore,
    items: files,
    isLoading: isFilesLoading,
  } = useResourceResults<FileInfo>(api, debouncedQuery, fileFilters);

  return (
    <>
      {currentView === 'tree' && (
        <>
          <GroupingTableContainer>
            <GroupingTableHeader>
              <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
                {!isDocumentsApiEnabled ? (
                  <FileTableFiltersFile
                    filter={fileFilters}
                    onFilterChange={handleFileFilterChange}
                  />
                ) : (
                  <FileTableFiltersDocument
                    filter={documentFilters}
                    onFilterChange={handleDocumentFilterChange}
                  />
                )}
              </DefaultPreviewFilter>
              <FileViewSwitcher
                currentView={currentView}
                setCurrentView={setCurrentView}
              />
            </GroupingTableHeader>
            {!isDocumentsApiEnabled ? (
              <AppliedFiltersTags
                filter={appliedFileFilter}
                onFilterChange={handleFileFilterChange}
              />
            ) : (
              <AppliedFiltersTags
                filter={appliedDocumentFilters}
                onFilterChange={handleDocumentFilterChange}
              />
            )}
            <GroupingTableWrapper>
              {!isDocumentsApiEnabled ? (
                <OldFileGroupTable
                  query={debouncedQuery}
                  filter={fileFilters}
                  currentView={currentView}
                  setCurrentView={setCurrentView}
                  onItemClicked={(file) => onClick(file)}
                />
              ) : (
                <FileGroupingTable
                  data={items}
                  onItemClicked={(file) => onClick(file)}
                  hasNextPage={hasNextPage}
                  fetchMore={fetchNextPage}
                  isLoadingMore={isDocumentsLoading}
                />
              )}
            </GroupingTableWrapper>
          </GroupingTableContainer>
        </>
      )}
      {currentView === 'list' &&
        (!isDocumentsApiEnabled ? (
          <FileTable
            id="file-linked-search-results"
            query={debouncedQuery}
            onRowClick={(file) => onClick(file)}
            data={files}
            // enableSorting
            // onSort={props => setSortBy(props)}
            showLoadButton
            tableSubHeaders={
              <AppliedFiltersTags
                filter={appliedFileFilter}
                onFilterChange={handleFileFilterChange}
              />
            }
            tableHeaders={
              <>
                <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
                  <FileTableFiltersFile
                    filter={fileFilters}
                    onFilterChange={handleFileFilterChange}
                  />
                </DefaultPreviewFilter>
                {isGroupingFilesEnabled && (
                  <FileViewSwitcher
                    setCurrentView={setCurrentView}
                    currentView={currentView}
                  />
                )}
              </>
            }
            hasNextPage={canFetchMore}
            fetchMore={fetchMore}
            isDataLoading={isFilesLoading}
          />
        ) : (
          <DocumentsTable
            id="file-linked-search-results"
            query={debouncedQuery}
            onRowClick={(file) => onClick(file)}
            onRootAssetClick={(directAsset) => {
              onParentAssetClick(directAsset.id);
            }}
            data={items}
            enableSorting
            sorting={sortBy}
            onSort={setSortBy}
            showLoadButton
            tableSubHeaders={
              <AppliedFiltersTags
                filter={appliedDocumentFilters}
                onFilterChange={handleDocumentFilterChange}
              />
            }
            tableHeaders={
              <>
                <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
                  <FileTableFiltersDocument
                    filter={documentFilters}
                    onFilterChange={handleDocumentFilterChange}
                  />
                </DefaultPreviewFilter>
                {isGroupingFilesEnabled && (
                  <FileViewSwitcher
                    setCurrentView={setCurrentView}
                    currentView={currentView}
                  />
                )}
              </>
            }
            hasNextPage={hasNextPage}
            fetchMore={fetchNextPage}
            isDataLoading={isDocumentsLoading}
          />
        ))}
    </>
  );
};
