import { Drawer } from '@data-exploration/components';

import { useState } from 'react';
import styled from 'styled-components';
import { SidebarFilters } from '../Search';
import { useFilterState } from './useFilterState';

export const ResourceSelector = ({
  visible = false,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const { state, setter, resetter } = useFilterState();
  const [query] = useState<string>('');

  return (
    <Drawer visible={visible} onClose={onClose}>
      <SearchFiltersWrapper>
        <FilterWrapper visible>
          <SidebarFilters
            query={query}
            filter={state}
            onFilterChange={(resourceType, currentFilter) => {
              setter(resourceType, currentFilter);
            }}
            resourceType="asset"
            onResetFilterClick={(type) => {
              resetter(type);
            }}
          />
        </FilterWrapper>
        <Dummy>Table list will be added here</Dummy>
      </SearchFiltersWrapper>
    </Drawer>
  );
};

const Dummy = styled.div`
  flex: 1;
`;
const SearchFiltersWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
  height: 100%;
`;
const FilterWrapper = styled.div<{ visible?: boolean }>`
  flex-basis: ${({ visible }) => (visible ? '260px' : '0px')};
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-left: 1px;
  border-right: 1px solid var(--cogs-border--muted);

  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  transition: visibility 0s linear 200ms, width 200ms ease;
`;
