import React from 'react';
import { FileInfo } from '@cognite/sdk';
import { FileTable } from 'containers/Files';
import { ResourceItem, convertResourceType } from 'types';

import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';
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
      onFileClicked={file => {
        onClick(file);
        return true;
      }}
      allowEdit={allowEdit}
    />
  );

  return (
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
  );
};

const StyledTableHeader = styled(Flex)`
  flex: 1;
`;
