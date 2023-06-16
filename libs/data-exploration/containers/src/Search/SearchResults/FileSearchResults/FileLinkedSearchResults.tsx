import React, { useMemo, useState } from 'react';

import {
  DefaultPreviewFilter,
  PreviewFilterDropdown,
} from '@data-exploration/components';
import { useDebounce } from 'use-debounce';

import { FileInfo } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';

import {
  convertResourceType,
  InternalCommonFilters,
  InternalDocumentFilter,
  InternalFilesFilters,
} from '@data-exploration-lib/core';
import {
  InternalDocument,
  transformNewFilterToOldFilter,
  useDocumentSearchResultQuery,
} from '@data-exploration-lib/domain-layer';

import {
  AppliedFiltersTags,
  DocumentsTable,
  FileGroupingTable,
  LabelFilter,
  MetadataFilter,
  SourceFilter,
  TypeFilter,
  AggregatedFilterV2,
  MetadataFilterV2,
  useResourceResults,
  OldFileGroupTable,
} from '../../../index';

import {
  GroupingTableHeader,
  GroupingTableContainer,
  GroupingTableWrapper,
} from './elements';
import { FileTable } from './FileTable';
import { FileViewSwitcher } from './FileViewSwitcher';

interface Props {
  defaultFilter: InternalCommonFilters;
  isGroupingFilesEnabled?: boolean;
  onClick: (item: FileInfo | InternalDocument) => void;
  onParentAssetClick: (assetId: number) => void;
  isDocumentsApiEnabled?: boolean;
}

const LinkedFileFilter = ({
  filter,
  onFilterChange,
}: {
  filter: InternalFilesFilters;
  onFilterChange: (newValue: InternalFilesFilters) => void;
}) => {
  const { data: items = [] } = useList<FileInfo>('files', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <PreviewFilterDropdown>
      <AggregatedFilterV2
        items={items}
        aggregator="mimeType"
        title="Mime type"
        value={filter.mimeType}
        setValue={(newValue) => onFilterChange({ mimeType: newValue })}
      />
      <MetadataFilterV2
        items={items}
        value={filter.metadata}
        setValue={(newValue) => onFilterChange({ metadata: newValue })}
      />
    </PreviewFilterDropdown>
  );
};

const LinkedDocumentFilter = ({
  filter,
  onFilterChange,
}: {
  filter: InternalDocumentFilter;
  onFilterChange: (newValue: InternalDocumentFilter) => void;
}) => {
  return (
    <PreviewFilterDropdown>
      <LabelFilter.File
        filter={filter}
        value={filter.labels}
        onChange={(newFilters) => onFilterChange({ labels: newFilters })}
      />
      <SourceFilter.File
        filter={filter}
        value={filter.source}
        onChange={(newSources) =>
          onFilterChange({
            source: newSources,
          })
        }
      />
      <TypeFilter.File
        filter={filter}
        value={filter.type}
        onChange={(newValue) => onFilterChange({ type: newValue as any })}
      />
      <MetadataFilter.Files
        filter={filter}
        values={filter.metadata}
        onChange={(newMetadata) => {
          onFilterChange({ metadata: newMetadata });
        }}
      />
    </PreviewFilterDropdown>
  );
};

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
  // const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

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
  } = useDocumentSearchResultQuery(
    {
      filter: documentFilters,
      query: debouncedQuery,
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
  } = useResourceResults<FileInfo>(api, debouncedQuery, fileFilters);

  return (
    <>
      {currentView === 'tree' && (
        <>
          <GroupingTableContainer>
            <GroupingTableHeader>
              <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
                {!isDocumentsApiEnabled ? (
                  <LinkedFileFilter
                    filter={fileFilters}
                    onFilterChange={handleFileFilterChange}
                  />
                ) : (
                  <LinkedDocumentFilter
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
                  query={debouncedQuery}
                  filter={documentFilters}
                  onItemClicked={(file) => onClick(file)}
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
                  <LinkedFileFilter
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
            // enableSorting
            // onSort={props => setSortBy(props)}
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
                  <LinkedDocumentFilter
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
          />
        ))}
    </>
  );
};
