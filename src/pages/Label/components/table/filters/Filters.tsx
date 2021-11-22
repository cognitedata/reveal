import { Loader } from '@cognite/cogs.js';
import React from 'react';
import { useDocumentsSearchMutate } from 'services/query/documents/mutate';
import { DocumentSearchQuery } from 'services/types';
import styled from 'styled-components';
import layers from 'utils/zIndex';
import { DocumentCategoryFilter } from './actions/DocumentType';
import { FileTypeFilter } from './actions/FileType';
import { NameFilter } from './actions/Name';
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

  const searchRef = React.useRef<DocumentSearchQuery>();

  const handleFilterChange = React.useCallback(
    (state: DocumentSearchQuery) => {
      const updatedFilters = { ...searchRef.current, ...state };
      searchRef.current = updatedFilters;
      mutate(updatedFilters);
    },
    [mutate]
  );

  return (
    <Container>
      <NameFilter onChange={handleFilterChange} />
      <SourceFilter onChange={handleFilterChange} />
      <FileTypeFilter onChange={handleFilterChange} />
      <DocumentCategoryFilter onChange={handleFilterChange} />

      {isLoading && <Loader darkMode={false} />}
    </Container>
  );
};
