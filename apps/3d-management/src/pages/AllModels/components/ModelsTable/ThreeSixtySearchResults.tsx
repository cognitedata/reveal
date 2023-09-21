// This file is inspired by the file ThreeDSearchResultsNew.tsx in the data-exploration project, but modified to be used in the 3d-management project.
import { useState } from 'react';

import styled from 'styled-components';

import { THREED_TABLE_ID } from '@data-exploration/containers';

import { FileTypeVisibility } from '@data-exploration-lib/core';
import { TableSortBy, use3DResults } from '@data-exploration-lib/domain-layer';

import { Model3DWithType } from '../../types';

import { ThreeSixtyTable } from './ThreeSixtyTable';

const FILE_VISIBILITY: FileTypeVisibility = {
  Models3D: false,
  Images360: true,
};

export const ThreeSixtySearchResults = () => {
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const { canFetchMore, fetchMore, models } = use3DResults(
    FILE_VISIBILITY,
    undefined, // no search query
    undefined, // no filter applied
    sortBy
  );

  return (
    <ThreeDSearchResultWrapper>
      <ThreeSixtyTable
        data={models as Model3DWithType[]}
        id={THREED_TABLE_ID}
        fetchMore={fetchMore}
        hasNextPage={canFetchMore}
        showLoadButton
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
