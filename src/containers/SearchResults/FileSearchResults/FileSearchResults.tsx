import React, { useState } from 'react';
import { FileInfo } from '@cognite/sdk';
import { FileTable } from 'containers/Files';
import { ResourceItem, convertResourceType } from 'types';

import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';
import FileGroupingTable from 'containers/Files/FileGroupingTable/FileGroupingTable';
import { FileToolbar } from './FileToolbar';
import { useResourceResults } from '..';
import { EmptyState } from 'components/EmpyState/EmptyState';
import styled from 'styled-components';
import { Flex } from '@cognite/cogs.js';

import { InternalFilesFilters } from 'domain/files';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';
import { useResultCount } from 'components';

export const FileSearchResults = ({
  query = '',
  filter = {},

  relatedResourceType,
  parentResource,
  isGroupingFilesEnabled,
  showCount = false,
  allowEdit = false,
  onClick,
  selectedRow,
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
  selectedRow?: Record<string | number, boolean>;
  allowEdit?: boolean;
  isGroupingFilesEnabled?: boolean;
  onClick: (item: FileInfo) => void;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
}) => {
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

  const { count: itemCount } = useResultCount({
    type: 'file',
    filter,
    query,
    api: query && query.length > 0 ? 'search' : 'list',
  });

  if (!isFetched) {
    return <EmptyState isLoading={!isFetched} />;
  }

  const tableHeaders = (
    <FileToolbar
      showCount={showCount}
      loadedCount={items.length}
      totalCount={itemCount}
      isHaveParent={Boolean(parentResource)}
      relatedResourceType={relatedResourceType}
      isGroupingFilesEnabled={isGroupingFilesEnabled}
      onFileClicked={file => {
        onClick(file);
        return true;
      }}
      currentView={currentView}
      onViewChange={setCurrentView}
      allowEdit={allowEdit}
    />
  );

  return (
    <>
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
        <FileTable
          selectedRows={selectedRow}
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
              icon="Document"
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
    </>
  );
};

const StyledTableHeader = styled(Flex)`
  flex: 1;
`;
