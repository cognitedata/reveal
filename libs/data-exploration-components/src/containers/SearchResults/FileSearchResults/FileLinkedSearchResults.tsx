import React, { useMemo, useState } from 'react';

import {
  DefaultPreviewFilter,
  PreviewFilterDropdown,
} from '@data-exploration/components';
import {
  AppliedFiltersTags,
  DocumentsTable,
  FileGroupingTable,
  LabelFilter,
  MetadataFilter,
  SourceFilter,
  TypeFilter,
} from '@data-exploration/containers';
import { useDebounce } from 'use-debounce';

import {
  InternalCommonFilters,
  InternalDocumentFilter,
} from '@data-exploration-lib/core';
import {
  InternalDocument,
  useDocumentSearchResultQuery,
} from '@data-exploration-lib/domain-layer';

import {
  GroupingTableHeader,
  GroupingTableContainer,
  GroupingTableWrapper,
} from './elements';
import { FileViewSwitcher } from './FileViewSwitcher';

interface Props {
  defaultFilter: InternalCommonFilters;
  isGroupingFilesEnabled?: boolean;
  onClick: (item: InternalDocument) => void;
  onParentAssetClick: (assetId: number) => void;
}

const LinkedFileFilter = ({
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
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [filter, setFilter] = useState<InternalDocumentFilter>({});
  const [currentView, setCurrentView] = useState<string>(
    isGroupingFilesEnabled ? 'tree' : 'list'
  );
  // const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const filesFilter = useMemo(() => {
    return {
      ...filter,
      ...defaultFilter,
    };
  }, [filter, defaultFilter]);

  const {
    fetchNextPage,
    results: items,
    hasNextPage,
  } = useDocumentSearchResultQuery({
    filter: filesFilter,
    query: debouncedQuery,
  });

  const appliedFilters = { ...filter, assetSubtreeIds: undefined };

  const handleFilterChange = (newValue: InternalDocumentFilter) => {
    setFilter((prevState) => ({ ...prevState, ...newValue }));
  };

  return (
    <>
      {currentView === 'tree' && (
        <>
          <GroupingTableContainer>
            <GroupingTableHeader>
              <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
                <LinkedFileFilter
                  filter={filesFilter}
                  onFilterChange={handleFilterChange}
                />
              </DefaultPreviewFilter>
              <FileViewSwitcher
                currentView={currentView}
                setCurrentView={setCurrentView}
              />
            </GroupingTableHeader>
            <AppliedFiltersTags
              filter={appliedFilters}
              onFilterChange={handleFilterChange}
            />
            <GroupingTableWrapper>
              <FileGroupingTable
                query={debouncedQuery}
                filter={filesFilter}
                onItemClicked={(file) => onClick(file)}
              />
            </GroupingTableWrapper>
          </GroupingTableContainer>
        </>
      )}
      {currentView === 'list' && (
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
              filter={appliedFilters}
              onFilterChange={handleFilterChange}
            />
          }
          tableHeaders={
            <>
              <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
                <LinkedFileFilter
                  filter={filesFilter}
                  onFilterChange={handleFilterChange}
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
      )}
    </>
  );
};
