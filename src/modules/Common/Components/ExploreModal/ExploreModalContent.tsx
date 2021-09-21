import React from 'react';
import { FileFilterProps } from '@cognite/cdf-sdk-singleton';
import { Body, Button, Title, Tooltip } from '@cognite/cogs.js';
import { TableDataItem } from 'src/modules/Common/types';
import { ExplorationSearchBar } from 'src/modules/Explorer/Containers/ExplorationSearchBar';
import { ExplorerSearchResults } from 'src/modules/Explorer/Containers/ExplorerSearchResults';
import styled from 'styled-components';
import { MAX_CID_FILE_COUNT } from 'src/constants/CIDConstants';

export type ExploreModalContentProps = {
  onItemClick: (item: TableDataItem) => void;
  onRowSelect: (item: TableDataItem, selected: boolean) => void;
  onCloseModal: () => void;
  onUseFiles: () => void;
  query?: string;
  onSearch: (text: string) => void;
  focusedId?: number | null;
  selectedIds: number[];
  selectedCount: number;
  filter: FileFilterProps;
  setFilter: (newFilter: FileFilterProps) => void;
  processFileCount: number;
};

export const ExploreModalContent = ({
  onItemClick,
  onRowSelect,
  query,
  onSearch,
  focusedId,
  selectedIds,
  onCloseModal,
  onUseFiles,
  selectedCount,
  filter,
  //  setFilter, TODO(VIS-276): Add filters
  processFileCount,
}: ExploreModalContentProps) => {
  const maxSelectCount = MAX_CID_FILE_COUNT;
  const count = selectedCount ? `[${selectedCount}]` : null;
  // TODO(VIS-278): Calculate the count with total number of items in the review page
  const inLimit = processFileCount + selectedCount <= maxSelectCount;
  const exceededLimitMessage = `Total number of files that can be processed simultaneously is ${maxSelectCount}`;
  return (
    <>
      <Header>
        <Title level={3}>Select from Explore</Title>
      </Header>
      <FilterBar>
        {/* TODO(VIS-276): Add filters */}
        <ExplorationSearchBar searchString={query} onChange={onSearch} />
        <Body level={2}>{selectedCount} selected</Body>
      </FilterBar>
      <ExploreTableContainer>
        <ExplorerSearchResults
          currentView="modal"
          filter={filter}
          query={query}
          focusedId={focusedId || undefined}
          selectedFileIds={selectedIds}
          onClick={onItemClick}
          onRowSelect={onRowSelect}
        />
      </ExploreTableContainer>
      <Footer>
        <Button type="secondary" onClick={onCloseModal}>
          Cancel
        </Button>
        <Tooltip
          content={
            <span data-testid="text-content">{exceededLimitMessage}</span>
          }
          disabled={inLimit}
        >
          <Button
            type="primary"
            icon="AddToList"
            onClick={onUseFiles}
            disabled={!count || !inLimit}
          >
            Use files
          </Button>
        </Tooltip>
      </Footer>
    </>
  );
};

const Header = styled.div`
  margin-bottom: 34px;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const ExploreTableContainer = styled.div`
  width: 950px;
  height: 528px;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
`;
