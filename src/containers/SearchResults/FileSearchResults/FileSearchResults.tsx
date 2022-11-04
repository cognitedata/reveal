import React, { useState } from 'react';
import { FileInfo } from '@cognite/sdk';
import { FileNewTable } from 'containers/Files';
import { ResourceItem, convertResourceType } from 'types';
import { EnsureNonEmptyResource } from 'components';
import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';
import FileGroupingTable from 'containers/Files/FileGroupingTable/FileGroupingTable';
import { FileToolbar } from './FileToolbar';
import { useResourceResults } from '..';
import { EmptyState } from 'components/EmpyState/EmptyState';
import styled from 'styled-components';
import { Flex } from '@cognite/cogs.js';
import { ColumnToggleProps } from 'components/ReactTable';
import { InternalFilesFilters } from 'domain/files';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';

export const FileSearchResults = ({
  query = '',
  filter = {},
  relatedResourceType,
  parentResource,
  count,
  isGroupingFilesEnabled,
  showCount = false,
  allowEdit = false,
  onClick,
  onFilterChange,
  ...rest
}: {
  query?: string;
  items?: FileInfo[];
  showCount?: boolean;
  filter?: InternalFilesFilters;
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  count?: number;
  allowEdit?: boolean;
  isGroupingFilesEnabled?: boolean;
  onClick: (item: FileInfo) => void;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
} & ColumnToggleProps<FileInfo>) => {
  // TODO: Remove this when migrated
  // if (filter.assetSubtreeIds) {
  //   filter = {
  //     ...filter,
  //     assetSubtreeIds: filter?.assetSubtreeIds?.map(({ value }: any) => ({
  //       id: value,
  //     })),
  //   };
  // }

  const [currentView, setCurrentView] = useState<string>(() => {
    if (
      Boolean(parentResource) &&
      relatedResourceType === 'linkedResource' &&
      isGroupingFilesEnabled
    ) {
      return 'tree';
    }
    return 'list';
  });
  const api = convertResourceType('file');
  const { canFetchMore, fetchMore, items, isFetched } =
    useResourceResults<FileInfo>(api, query, filter);

  if (!isFetched) {
    return <EmptyState isLoading={!isFetched} />;
  }
  const tableHeaders = (
    <FileToolbar
      showCount={showCount}
      isHaveParent={Boolean(parentResource)}
      relatedResourceType={relatedResourceType}
      query={query}
      isGroupingFilesEnabled={isGroupingFilesEnabled}
      filter={filter}
      onFileClicked={file => {
        onClick(file);
        return true;
      }}
      currentView={currentView}
      onViewChange={setCurrentView}
      allowEdit={allowEdit}
      count={count}
    />
  );

  return (
    <>
      <EnsureNonEmptyResource api="file">
        {currentView !== 'list' ? (
          <StyledTableHeader>{tableHeaders}</StyledTableHeader>
        ) : null}
        {currentView === 'tree' && (
          <FileGroupingTable
            parentResource={parentResource}
            onItemClicked={file => onClick(file)}
          />
        )}

        {currentView === 'list' && (
          <FileNewTable
            id="file-search-results"
            tableHeaders={
              <StyledTableHeader justifyContent="flex-end">
                {tableHeaders}
              </StyledTableHeader>
            }
            tableSubHeaders={
              <AppliedFiltersTags
                filter={filter}
                onFilterChange={onFilterChange}
              />
            }
            data={items}
            onRowClick={file => onClick(file)}
            fetchMore={fetchMore}
            showLoadButton
            hasNextPage={canFetchMore}
            {...rest}
          />
        )}
      </EnsureNonEmptyResource>
    </>
  );
};

const StyledTableHeader = styled(Flex)`
  flex: 1;
`;
