import React from 'react';

import styled from 'styled-components';

import { Loader } from '@cognite/cogs.js';

import { useDocumentsSearchMutate } from '../../../../../services/query/documents/mutate';
import { DocumentSearchQuery } from '../../../../../services/types';
import layers from '../../../../../utils/zIndex';

import { FileTypeFilter } from './actions/FileType';
import { LabelFilter } from './actions/Label';
import { NameFilter } from './actions/Name';
import { ShowLabeledFilesFilter } from './actions/ShowLabeledFiles';
import { SourceFilter } from './actions/Source';

const Container = styled.div`
  display: flex;
  margin: 1rem 0;

  .cogs-select {
    z-index: ${layers.SELECT_MENU};
  }

  & > * {
    margin-left: 0.5rem;
  }
`;

export const DocumentsFilters: React.FC = () => {
  const { mutate, isLoading } = useDocumentsSearchMutate();

  // Using useRef instead of useState to keep same reference
  // across rerenders, to improve memoization and debouncing.
  // useCallback is used for the same reasons.

  const searchRef = React.useRef<DocumentSearchQuery>({
    showDocumentsLabeledInFiles: false,
  });

  const handleFilterChange = React.useCallback(
    (state: Partial<DocumentSearchQuery>) => {
      searchRef.current = { ...searchRef.current, ...state };
      mutate(searchRef.current);
    },
    [mutate]
  );

  const handleSearchQueryChange = React.useCallback(
    (value: string) => {
      handleFilterChange({ searchQuery: value });
    },
    [handleFilterChange]
  );

  const handleSourceChange = React.useCallback(
    (values: string[]) => {
      handleFilterChange({ sources: values });
    },
    [handleFilterChange]
  );

  const handleFileTypeChange = React.useCallback(
    (values: string[]) => {
      handleFilterChange({ fileTypes: values });
    },
    [handleFilterChange]
  );

  const handleLabelsChange = React.useCallback(
    (values: string[]) => {
      handleFilterChange({ labels: values });
    },
    [handleFilterChange]
  );

  const handleShowLabeledFilesChange = React.useCallback(
    (value: boolean) => {
      handleFilterChange({ showDocumentsLabeledInFiles: value });
    },
    [handleFilterChange]
  );

  return (
    <Container>
      <NameFilter onChange={handleSearchQueryChange} />
      <SourceFilter onChange={handleSourceChange} />
      <FileTypeFilter onChange={handleFileTypeChange} />
      <LabelFilter onChange={handleLabelsChange} />

      <ShowLabeledFilesFilter onChange={handleShowLabeledFilesChange} />
      {isLoading && <Loader darkMode={false} />}
    </Container>
  );
};
