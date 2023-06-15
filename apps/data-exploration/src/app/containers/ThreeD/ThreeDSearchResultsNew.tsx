import React, { useState } from 'react';

import styled from 'styled-components';

import {
  DEFAULT_VISIBILITY,
  FileTypeToggle,
} from '@data-exploration/components';
import { ThreeDTable, THREED_TABLE_ID } from '@data-exploration/containers';
import useLocalStorageState from 'use-local-storage-state';

import {
  FileTypeVisibility,
  InternalThreeDFilters,
} from '@data-exploration-lib/core';
import {
  Model3DWithType,
  TableSortBy,
  use3DResults,
} from '@data-exploration-lib/domain-layer';

export const ThreeDSearchResultsNew = ({
  query = '',
  filter = {},
  onClick,
}: {
  filter?: InternalThreeDFilters;
  query?: string | undefined;
  onClick: (item: Model3DWithType) => void;
}) => {
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const [fileTypeVisibility, setFileTypeVisibility] =
    useLocalStorageState<FileTypeVisibility>(`${THREED_TABLE_ID}-file-types`, {
      defaultValue: DEFAULT_VISIBILITY,
    });

  const { canFetchMore, fetchMore, models } = use3DResults(
    fileTypeVisibility,
    query,
    filter,
    sortBy
  );

  const FilterHeader = FileTypeToggle(
    fileTypeVisibility,
    setFileTypeVisibility
  );

  return (
    <ThreeDSearchResultWrapper>
      <ThreeDTable
        data={models as Model3DWithType[]}
        id={THREED_TABLE_ID}
        fetchMore={fetchMore}
        hasNextPage={canFetchMore}
        showLoadButton
        onRowClick={onClick}
        FilterHeader={FilterHeader}
        enableSorting
        onSort={setSortBy}
        sorting={sortBy}
        manualSorting={true}
      />
    </ThreeDSearchResultWrapper>
  );
};

export const ThreeDSearchResultWrapper = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
`;
