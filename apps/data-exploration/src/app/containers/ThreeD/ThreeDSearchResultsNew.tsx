import React from 'react';

import styled from 'styled-components';

import {
  DEFAULT_VISIBILITY,
  FileTypeToggle,
} from '@data-exploration/components';
import { ThreeDTable } from '@data-exploration/containers';
import useLocalStorageState from 'use-local-storage-state';

import { Loader } from '@cognite/cogs.js';

import {
  FileTypeVisibility,
  InternalThreeDFilters,
} from '@data-exploration-lib/core';
import {
  Model3DWithType,
  use3DResults,
} from '@data-exploration-lib/domain-layer';

const ID = '3d-model-table';

export const ThreeDSearchResultsNew = ({
  query = '',
  filter = {},
  onClick,
}: {
  filter?: InternalThreeDFilters;
  query?: string | undefined;
  onClick: (item: Model3DWithType) => void;
}) => {
  const [fileTypeVisibility, setFileTypeVisibility] =
    useLocalStorageState<FileTypeVisibility>(`${ID}-file-types`, {
      defaultValue: DEFAULT_VISIBILITY,
    });

  const {
    canFetchMore,
    fetchMore,
    items: models,
    isFetching,
  } = use3DResults(fileTypeVisibility, query, filter);

  const FilterHeader = FileTypeToggle(
    fileTypeVisibility,
    setFileTypeVisibility
  );

  if (isFetching) {
    return <Loader />;
  }

  return (
    <ThreeDSearchResultWrapper>
      <ThreeDTable
        data={models as Model3DWithType[]}
        id={ID}
        fetchMore={fetchMore}
        hasNextPage={canFetchMore}
        showLoadButton
        onRowClick={onClick}
        FilterHeader={FilterHeader}
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
