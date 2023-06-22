import React from 'react';

import styled from 'styled-components';

import { EmptyState } from '@data-exploration/components';

import { Flex } from '@cognite/cogs.js';
import { Asset, FileInfo } from '@cognite/sdk';

import {
  convertResourceType,
  InternalFilesFilters,
} from '@data-exploration-lib/core';

import { AppliedFiltersTags, useResourceResults } from '../../../index';
import { useResultCount } from '../../../Temp';

import { FileTable } from './FileTable';
import { FileToolbar } from './FileToolbar';

export const FileSearchResults = ({
  query = '',
  filter = {},
  showCount = false,
  allowEdit = false,
  onClick,
  onDirectAssetClick,
  selectedRow,
  onFilterChange,
  ...rest
}: {
  query?: string;
  items?: FileInfo[];
  showCount?: boolean;
  filter?: InternalFilesFilters;
  showRelatedResources?: boolean;
  selectedRow?: Record<string | number, boolean>;
  allowEdit?: boolean;
  isGroupingFilesEnabled?: boolean;
  onClick: (item: FileInfo) => void;
  onDirectAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
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
      onFileClicked={(file) => {
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
      query={query}
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
      onRowClick={(file) => onClick(file)}
      onDirectAssetClick={onDirectAssetClick}
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
