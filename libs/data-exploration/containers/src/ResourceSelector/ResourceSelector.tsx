import { ResourceType, useDialog, ViewType } from '@data-exploration-lib/core';
import { Drawer, ExplorationFilterToggle } from '@data-exploration/components';
import { Divider, Flex, Input } from '@cognite/cogs.js';
import { useState } from 'react';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce';
import { SidebarFilters } from '../Search';
import {
  AssetsTab,
  DocumentsTab,
  EventsTab,
  ResourceTypeTabs,
  SequenceTab,
  ThreeDTab,
  TimeseriesTab,
} from '../ResourceTabs';
import { useFilterState } from './useFilterState';
import { ResourceSelectorTable } from './ResourceSelectorTable';

const DEFAULT_VISIBLE_RESOURCE_TABS: ResourceType[] = [
  'asset',
  'file',
  'event',
  'sequence',
  'timeSeries',
];
export const ResourceSelector = ({
  visible = false,
  visibleResourceTabs = DEFAULT_VISIBLE_RESOURCE_TABS,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
  visibleResourceTabs?: ResourceType[];
}) => {
  const { state, setter, resetter } = useFilterState();
  const [query, setQuery] = useState<string>('');
  const { isOpen: showFilter, toggle: onToggleFilter } = useDialog();
  const [activeKey, setActiveKey] = useState(visibleResourceTabs[0]);

  const [debouncedQuery] = useDebounce(query, 100);

  return (
    <Drawer visible={visible} onClose={onClose}>
      <SearchFiltersWrapper>
        <FilterWrapper visible={showFilter}>
          <SidebarFilters
            query={query}
            enableDocumentLabelsFilter
            filter={state}
            onFilterChange={(resourceType, currentFilter) => {
              setter(resourceType, currentFilter);
            }}
            resourceType={activeKey}
            onResetFilterClick={(type) => {
              resetter(type);
            }}
          />
        </FilterWrapper>

        <MainSearchContainer>
          <SearchInputContainer>
            <>
              <ExplorationFilterToggle
                filterState={showFilter}
                onClick={onToggleFilter}
              />
              <Divider direction="vertical" />
            </>
            <InputWrapper>
              <Input
                size="large"
                variant="noBorder"
                autoFocus
                fullWidth
                icon="Search"
                placeholder="Search..."
                onChange={(ev) => setQuery(ev.target.value)}
                value={query}
              />
            </InputWrapper>
          </SearchInputContainer>

          <ResourceTypeTabs
            currentResourceType={activeKey}
            setCurrentResourceType={(tab) => setActiveKey(tab as ResourceType)}
          >
            {visibleResourceTabs.map((tab) => {
              if (tab === 'asset')
                return (
                  <AssetsTab
                    key={tab}
                    tabKey={ViewType.Asset}
                    query={debouncedQuery}
                    filter={{ ...state.common, ...state.asset }}
                    label="Assets"
                  />
                );
              if (tab === 'event')
                return (
                  <EventsTab
                    key={tab}
                    tabKey={ViewType.Event}
                    query={debouncedQuery}
                    filter={state.event}
                    label="Events"
                  />
                );
              if (tab === 'file')
                return (
                  <DocumentsTab
                    key={tab}
                    tabKey={ViewType.File}
                    query={debouncedQuery}
                    filter={state.document}
                    label="Files"
                  />
                );
              if (tab === 'timeSeries')
                return (
                  <TimeseriesTab
                    key={tab}
                    tabKey={ViewType.TimeSeries}
                    query={debouncedQuery}
                    filter={state.timeseries}
                    label="Time series"
                  />
                );
              if (tab === 'sequence')
                return (
                  <SequenceTab
                    tabKey={ViewType.Sequence}
                    query={debouncedQuery}
                    filter={state.sequence}
                    label="Sequence"
                  />
                );
              return (
                <ThreeDTab tabKey={ViewType.ThreeD} query={debouncedQuery} />
              );
            })}
          </ResourceTypeTabs>
          <MainContainer>
            <ResourceSelectorTable
              filter={state}
              query={debouncedQuery}
              resourceType={activeKey}
            />
          </MainContainer>
        </MainSearchContainer>
      </SearchFiltersWrapper>
    </Drawer>
  );
};

const MainSearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  overflow: auto;
`;
const SearchFiltersWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
  height: 100%;
`;
const FilterWrapper = styled.div<{ visible?: boolean }>`
  width: ${({ visible }) => (visible ? '260px' : '0px')};
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-left: 1px;
  border-right: 1px solid var(--cogs-border--muted);

  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  transition: visibility 0s linear 200ms, width 200ms ease;
`;

const InputWrapper = styled.div`
  width: 93%;
`;

const SearchInputContainer = styled(Flex)`
  padding: 16px;
  padding-bottom: 12px;
  align-items: center;
  display: flex;
  gap: 8px;
`;

const MainContainer = styled(Flex)<{ isFilterFeatureEnabled?: boolean }>`
  padding-left: ${({ isFilterFeatureEnabled }) =>
    isFilterFeatureEnabled ? '0px' : '16px'};
  height: 100%;
  flex: 1;
  overflow: auto;
`;
