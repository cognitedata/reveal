import React, { useMemo, useState } from 'react';

import { AppliedFiltersTags } from '@data-exploration-components/components/AppliedFiltersTags/AppliedFiltersTags';

import { PreviewFilterDropdown } from '@data-exploration-components/components/PreviewFilter/PreviewFilterDropdown';
import { DefaultPreviewFilter } from '@data-exploration-components/components/PreviewFilter/PreviewFilter';
import { useDebounce } from 'use-debounce';

import FileGroupingTable from '@data-exploration-components/containers/Files/FileGroupingTable/FileGroupingTable';
import {
  GroupingTableHeader,
  GroupingTableContainer,
  GroupingTableWrapper,
} from './elements';
import { FileViewSwitcher } from './FileViewSwitcher';
import {
  InternalCommonFilters,
  InternalDocumentFilter,
} from '@data-exploration-lib/core';
import { MetadataFilter, TypeFilter } from '@data-exploration/containers';
import {
  InternalDocument,
  useDocumentSearchResultQuery,
} from '@data-exploration-lib/domain-layer';
import { DocumentsTable } from '@data-exploration-components/containers/Documents';

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
