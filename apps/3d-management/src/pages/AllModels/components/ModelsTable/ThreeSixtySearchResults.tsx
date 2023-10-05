// This file is inspired by the file ThreeDSearchResultsNew.tsx in the data-exploration project, but modified to be used in the 3d-management project.
import { useState } from 'react';

import styled from 'styled-components';

import { THREED_TABLE_ID } from '@data-exploration/containers';

import { FileTypeVisibility } from '@data-exploration-lib/core';
import { TableSortBy, use3DResults } from '@data-exploration-lib/domain-layer';

import Spinner from '../../../../components/Spinner';
import { Model3DWithType } from '../../types';

import { ThreeSixtyTable } from './ThreeSixtyTable';

const FILE_VISIBILITY: FileTypeVisibility = {
  Models3D: false,
  Images360: true,
};

const LIMIT_PER_PAGE = 15;

export const ThreeSixtySearchResults = ({
  showAssetTagDetectionButton,
  onRunAssetTagClick,
}: {
  showAssetTagDetectionButton: boolean;
  onRunAssetTagClick: (image360id: string) => void;
}) => {
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const { canFetchMore, fetchMore, models, isFetching } = use3DResults(
    FILE_VISIBILITY,
    undefined, // no search query
    undefined, // no filter applied
    sortBy,
    LIMIT_PER_PAGE
  );

  if (isFetching) {
    return <Spinner />;
  }

  return (
    <ThreeDSearchResultWrapper>
      <ThreeSixtyTable
        showAssetTagDetectionButton={showAssetTagDetectionButton}
        onRunAssetTagClick={onRunAssetTagClick}
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
