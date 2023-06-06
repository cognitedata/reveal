import { useCallback, useMemo, useState } from 'react';

import styled from 'styled-components';

import {
  BulkActionbar,
  Drawer,
  ExplorationFilterToggle,
} from '@data-exploration/components';
import { RowSelectionState, Updater } from '@tanstack/react-table';
import isEmpty from 'lodash/isEmpty';
import mapValues from 'lodash/mapValues';
import noop from 'lodash/noop';
import { useDebounce } from 'use-debounce';

import { Button, Divider, Flex, Input } from '@cognite/cogs.js';

import {
  EMPTY_OBJECT,
  FilterState,
  ResourceItem,
  ResourceType,
  useDialog,
  ViewType,
} from '@data-exploration-lib/core';

import {
  AssetsTab,
  DocumentsTab,
  EventsTab,
  ResourceTypeTabs,
  SequenceTab,
  ThreeDTab,
  TimeseriesTab,
} from '../ResourceTabs';
import { SidebarFilters } from '../Search';

import { ResourceSelectorDetails } from './ResourceSelectorDetails';
import { ResourceSelectorTable } from './ResourceSelectorTable';
import { useFilterState } from './useFilterState';

const DEFAULT_VISIBLE_RESOURCE_TABS: ResourceType[] = [
  'asset',
  'file',
  'event',
  'timeSeries',
];

const initialSelectedRows = {
  asset: {},
  file: {},
  timeSeries: {},
  sequence: {},
  threeD: {},
  event: {},
};

export type SelectionProps =
  | {
      selectionMode: 'single';
      onSelect?: (item: ResourceItem) => void;
    }
  | { selectionMode: 'multiple'; onSelect?: (item: ResourceItem[]) => void };

export type ResourceSelection = Record<
  ResourceType,
  Record<string, ResourceItem>
>;
export const ResourceSelector = ({
  visible = false,

  visibleResourceTabs = DEFAULT_VISIBLE_RESOURCE_TABS,
  selectionMode = 'single',
  initialFilter = EMPTY_OBJECT,
  onClose,
  onSelect = noop,
}: {
  visible: boolean;
  onClose: () => void;
  visibleResourceTabs?: ResourceType[];
  initialFilter?: Partial<FilterState>;
} & Partial<SelectionProps>) => {
  const { state, setter, resetter } = useFilterState(initialFilter);
  const [query, setQuery] = useState<string>('');
  const { isOpen: showFilter, toggle: onToggleFilter } = useDialog();
  const [activeKey, setActiveKey] = useState(visibleResourceTabs[0]);
  const [previewItem, setPreviewItem] = useState<ResourceItem>();

  const [debouncedQuery] = useDebounce(query, 100);
  const [selectedRows, setSelectedRows] =
    useState<ResourceSelection>(initialSelectedRows);
  const allSelectedRows = useMemo(
    () =>
      Object.entries(selectedRows)
        .filter(([_, value]) => !isEmpty(value))
        .reduce((acc, item) => {
          acc.push(
            ...Object.values(item[1]).map((value) => ({
              ...value,
              type: item[0] as ResourceType,
            }))
          );
          return acc;
        }, [] as ResourceItem[]),
    [selectedRows]
  );

  const actionBarOptions = useMemo(
    () =>
      allSelectedRows.map((value) => ({
        name: value.externalId || `${value.id}`,
        type: value.type,
      })),
    [allSelectedRows]
  );
  const onDetailRowSelection = useCallback(
    (
      updater?: Updater<RowSelectionState>,
      currentData?: ResourceItem[],
      resourceType?: ResourceType
    ) => {
      setSelectedRows((prev) => {
        if (updater && currentData && resourceType) {
          if (typeof updater === 'function') {
            return {
              ...prev,
              [resourceType]: mapValues(
                updater(
                  mapValues(prev[resourceType], function (resourceItem) {
                    return Boolean(resourceItem?.id);
                  })
                ),
                function (_, key) {
                  return currentData.find((item) => String(item?.id) === key);
                }
              ),
            };
          }
          return {
            ...prev,
            [resourceType]: mapValues(updater, function (_, key) {
              return currentData.find((item) => String(item?.id) === key);
            }),
          };
        }
        return {
          ...prev,
          [previewItem!.type]: {
            ...prev[previewItem!.type],
            [previewItem!.id]: previewItem,
          },
        };
      });
    },
    [previewItem]
  );

  return (
    <>
      <Drawer
        visible={visible}
        onClose={() => {
          onClose();
          setSelectedRows(initialSelectedRows);
        }}
      >
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
              setCurrentResourceType={(tab) =>
                setActiveKey(tab as ResourceType)
              }
            >
              {visibleResourceTabs.map((tab) => {
                if (tab === 'asset')
                  return (
                    <AssetsTab
                      key={tab}
                      tabKey={ViewType.Asset}
                      label="Assets"
                      query={debouncedQuery}
                      filter={{ ...state.common, ...state.asset }}
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
                      label="Time Series"
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
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                filter={state}
                selectionMode={selectionMode}
                query={debouncedQuery}
                resourceType={activeKey}
                onFilterChange={(nextState) => {
                  setter(
                    activeKey === 'file' ? 'document' : activeKey,
                    nextState
                  );
                }}
                onClick={({ id, externalId }) => {
                  setPreviewItem({ id, externalId, type: activeKey });
                }}
              />
            </MainContainer>
          </MainSearchContainer>
          {visible && previewItem && (
            <ResourcePreviewSidebarWrapper>
              <ResourceSelectorDetails
                item={previewItem}
                closable={true}
                onClose={() => setPreviewItem(undefined)}
                selectionMode={selectionMode}
                selectedRows={selectedRows}
                onSelect={onDetailRowSelection}
                isSelected={Boolean(
                  selectedRows[previewItem.type][previewItem.id]
                )}
              />
            </ResourcePreviewSidebarWrapper>
          )}
          <BulkActionbar
            options={actionBarOptions}
            title={`${actionBarOptions.length} items`}
            subtitle="Selected"
            isVisible={actionBarOptions.length > 0}
          >
            <Button
              icon="Add"
              onClick={() => {
                if (selectionMode === 'multiple')
                  onSelect(allSelectedRows as any);
                if (selectionMode === 'single')
                  onSelect(allSelectedRows[0] as any);
                setSelectedRows(initialSelectedRows);
              }}
              inverted
              type="secondary"
            >
              Add to Canvas
            </Button>
            <BulkActionbar.Separator />
            <Button
              icon="Close"
              onClick={() => setSelectedRows(initialSelectedRows)}
              inverted
            />
          </BulkActionbar>
        </SearchFiltersWrapper>
      </Drawer>
    </>
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
  position: relative;
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
  padding-bottom: 50px;
  overflow: auto;
`;

const ResourcePreviewSidebarWrapper = styled.div`
  width: 360px;
  margin: 12px;
  flex: 1;
  border-left: 1px solid var(--cogs-border--muted);
`;
