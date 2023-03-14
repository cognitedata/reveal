import React, { useMemo, useState } from 'react';
import { FileInfo } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';

import {
  AggregatedFilterV2,
  MetadataFilterV2,
} from '@data-exploration-components/components';
import { AppliedFiltersTags } from '@data-exploration-components/components/AppliedFiltersTags/AppliedFiltersTags';
import { transformNewFilterToOldFilter } from '@data-exploration-lib/domain-layer';

import { PreviewFilterDropdown } from '@data-exploration-components/components/PreviewFilter/PreviewFilterDropdown';
import { DefaultPreviewFilter } from '@data-exploration-components/components/PreviewFilter/PreviewFilter';
import { InternalCommonFilters } from '@data-exploration-lib/domain-layer';
import { useDebounce } from 'use-debounce';
import { InternalFilesFilters } from '@data-exploration-lib/domain-layer';
import { convertResourceType } from '@data-exploration-components/types';
import { useResourceResults } from '../SearchResultLoader';
import { FileTable } from '@data-exploration-components/containers/Files';
import FileGroupingTable from '@data-exploration-components/containers/Files/FileGroupingTable/FileGroupingTable';
import {
  GroupingTableHeader,
  GroupingTableContainer,
  GroupingTableWrapper,
} from './elements';
import { FileViewSwitcher } from './FileViewSwitcher';

interface Props {
  defaultFilter: InternalCommonFilters;
  isGroupingFilesEnabled?: boolean;
  onClick: (item: FileInfo) => void;
  onParentAssetClick: (assetId: number) => void;
}

const LinkedFileFilter = ({
  filter,
  onFilterChange,
}: {
  filter: InternalFilesFilters;
  onFilterChange: (newValue: InternalFilesFilters) => void;
}) => {
  const { data: items = [] } = useList<any>('files', {
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

export const FileLinkedSearchResults: React.FC<Props> = ({
  defaultFilter,
  isGroupingFilesEnabled,
  onClick,
  onParentAssetClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [filter, setFilter] = useState<InternalFilesFilters>({});
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

  const api = convertResourceType('file');
  const { canFetchMore, fetchMore, items } = useResourceResults<FileInfo>(
    api,
    debouncedQuery,
    filesFilter
  );

  const appliedFilters = { ...filter, assetSubtreeIds: undefined };

  const handleFilterChange = (newValue: InternalFilesFilters) => {
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
        <FileTable
          id="file-linked-search-results"
          query={debouncedQuery}
          onRowClick={(file) => onClick(file)}
          onDirectAssetClick={(directAsset) => {
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
          hasNextPage={canFetchMore}
          fetchMore={fetchMore}
        />
      )}
    </>
  );
};
