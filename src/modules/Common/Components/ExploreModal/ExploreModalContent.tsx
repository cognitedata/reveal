import React from 'react';
import { FileFilterProps } from '@cognite/cdf-sdk-singleton';
import { Button, Title, Tooltip } from '@cognite/cogs.js';
import { ExplorationSearchBar } from 'src/modules/Explorer/Containers/ExplorationSearchBar';
import { ExplorerSearchResults } from 'src/modules/Explorer/Containers/ExplorerSearchResults';
import styled from 'styled-components';
import { MAX_SELECT_COUNT } from 'src/constants/ExplorerConstants';
import { TableDataItem } from '../../types';

export type ExploreModalContentProps = {
  onItemClick: (item: TableDataItem) => void;
  onRowSelect: (item: TableDataItem, selected: boolean) => void;
  onCloseModal: () => void;
  onUseFiles: () => void;
  query?: string;
  onSearch: (text: string) => void;
  selectedId?: number | null;
  selectedCount: number;
  filter: FileFilterProps;
  setFilter: (newFilter: FileFilterProps) => void;
};

export const ExploreModalContent = ({
  onItemClick,
  onRowSelect,
  query,
  onSearch,
  selectedId,
  onCloseModal,
  onUseFiles,
  selectedCount,
  filter,
  // TODO(VIS-276): Add filters
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setFilter,
}: ExploreModalContentProps) => {
  const maxSelectCount = MAX_SELECT_COUNT;
  const count = selectedCount ? `[${selectedCount}]` : null;
  // TODO(VIS-278): Calculate the count with total number of items in the review page
  const inLimit =
    selectedCount && maxSelectCount ? selectedCount <= maxSelectCount : true;
  const exceededLimitMessage = `Total number of files that can be processed simultaneously is ${maxSelectCount}`;
  return (
    <>
      <Header>
        <Title level={3}>Select from Explore</Title>
      </Header>
      <FilterBar>
        {/* TODO(VIS-276): Add filters */}
        <ExplorationSearchBar searchString={query} onChange={onSearch} />
        {/* TODO(VIS-277): Add selected count */}
      </FilterBar>
      <ExploreTableContainer>
        <ExplorerSearchResults
          filter={filter}
          onClick={onItemClick}
          onRowSelect={onRowSelect}
          query={query}
          selectedId={selectedId || undefined}
          currentView="modal"
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
          disabled={!!inLimit}
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
