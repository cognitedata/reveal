import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';

import {
  BulkActionBar,
  ExplorationFilterToggle,
} from '@data-exploration/components';
import noop from 'lodash/noop';

import { Button, Divider, Flex, Input } from '@cognite/cogs.js';

import {
  EMPTY_OBJECT,
  FilterState,
  ResourceItem,
  ResourceSelectorFilter,
  ExtendedResourceItem,
  ResourceType,
  useDebouncedQuery,
  useDialog,
  useTranslation,
  ViewType,
  INITIAL_SELECTED_ROWS,
} from '@data-exploration-lib/core';

import {
  AssetsTab,
  FilesTab,
  EventsTab,
  ResourceTypeTabs,
  SequenceTab,
  ThreeDTab,
  TimeseriesTab,
} from '../ResourceTabs';
import { SidebarFilters } from '../Search';

import { ChartsTab } from './Charts';
import { ResourceSelectorDetails } from './ResourceSelectorDetails';
import { ResourceSelectorTable } from './ResourceSelectorTable';
import { useFilterState } from './useFilterState';
import { mapAllSelectedRows } from './utils/mapAllSelectedRows';

const DEFAULT_VISIBLE_RESOURCE_TABS: ResourceType[] = [
  'asset',
  'file',
  'event',
  'timeSeries',
];

type SelectionProps =
  | {
      selectionMode: 'single';
      onSelect?: (item: ResourceItem) => void;
    }
  | { selectionMode: 'multiple'; onSelect?: (items: ResourceItem[]) => void };

// use this type from core.
export type ResourceSelection = Record<
  ResourceType,
  Record<string, ResourceItem>
>;

export type ResourceSelectorProps = {
  visibleResourceTabs?: ResourceType[];
  initialFilter?: ResourceSelectorFilter;
  initialTab?: ResourceType;
  initialSelectedResource?: ResourceItem;
  addButtonText?: string;
  isDocumentsApiEnabled?: boolean;
  shouldShowPreviews?: boolean;
  shouldOnlyShowPreviewPane?: boolean;
  shouldDisableAddButton?: boolean;
  defaultFilter?: Partial<FilterState>;
} & SelectionProps;

export const ResourceSelector = ({
  visibleResourceTabs = DEFAULT_VISIBLE_RESOURCE_TABS,
  selectionMode = 'single',
  initialFilter = EMPTY_OBJECT,
  initialTab = visibleResourceTabs[0],
  onSelect = noop,
  initialSelectedResource,
  isDocumentsApiEnabled = true,
  addButtonText,
  shouldShowPreviews = true,
  shouldOnlyShowPreviewPane = false,
  shouldDisableAddButton = false,
  defaultFilter = {},
}: ResourceSelectorProps) => {
  const { filterState, updateFilterType, resetFilterType } =
    useFilterState(initialFilter);
  const [query, setQuery] = useState<string>('');
  const [localQuery, setLocalQuery] = useDebouncedQuery<string>(
    (newValue) => setQuery(newValue || ''),
    query
  );

  const { isOpen: showFilter, toggle: onToggleFilter } = useDialog();

  const [activeKey, setActiveKey] = useState(initialTab);
  const [previewItem, setPreviewItem] = useState<ExtendedResourceItem>();
  const { t } = useTranslation();

  const [selectedRows, setSelectedRows] = useState<ResourceSelection>(
    INITIAL_SELECTED_ROWS
  );
  const [selectedResources, setSelectedResources] = useState<ResourceItem[]>(
    []
  );

  const [extendedProperties, setExtendedProperties] = useState<
    Record<number, ExtendedResourceItem> | undefined
  >(undefined);

  useEffect(() => {
    if (initialSelectedResource === undefined) {
      setPreviewItem(undefined);
      return;
    }

    setPreviewItem(initialSelectedResource);
    setActiveKey(initialSelectedResource.type);
  }, [initialSelectedResource]);

  useEffect(() => {
    if (initialTab === undefined) {
      return;
    }

    setActiveKey(initialTab);
  }, [initialTab]);

  const actionBarOptions = useMemo(
    () =>
      selectedResources.map((value) => ({
        name: value.externalId || `${value.id}`,
        type: value.type,
      })),
    [selectedResources]
  );

  const handleResourceSelection = useCallback(
    (selection: ResourceSelection) => {
      const resources = mapAllSelectedRows(selection, extendedProperties);
      setSelectedRows(selection);
      setSelectedResources(resources);

      if (selectionMode === 'single') {
        onSelect(resources[0] as any);
        setSelectedRows(INITIAL_SELECTED_ROWS);
      }
    },
    [onSelect, selectionMode, extendedProperties]
  );

  const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(event.target.value);
  };

  const selectedResourceTabs = visibleResourceTabs.map((tab) => {
    if (tab === 'charts')
      return (
        <ChartsTab
          key={tab}
          tabKey={ViewType.Charts}
          label={t('CHARTS', 'Charts')}
          query={query}
          filter={filterState.charts}
        />
      );
    if (tab === 'asset')
      return (
        <AssetsTab
          key={tab}
          tabKey={ViewType.Asset}
          label={t('ASSETS', 'Assets')}
          query={query}
          filter={{ ...filterState.common, ...filterState.asset }}
        />
      );
    if (tab === 'event')
      return (
        <EventsTab
          key={tab}
          tabKey={ViewType.Event}
          query={query}
          filter={{ ...filterState.common, ...filterState.event }}
          label={t('EVENTS', 'Events')}
        />
      );
    if (tab === 'file')
      return (
        <FilesTab
          key={tab}
          tabKey={ViewType.File}
          query={query}
          filter={{
            ...filterState.common,
            ...(isDocumentsApiEnabled
              ? filterState.document
              : filterState.file),
          }}
          defaultFilter={
            isDocumentsApiEnabled ? defaultFilter.document : defaultFilter.file
          }
          isDocumentsApiEnabled={isDocumentsApiEnabled}
          label={t('FILES', 'Files')}
        />
      );
    if (tab === 'timeSeries')
      return (
        <TimeseriesTab
          key={tab}
          tabKey={ViewType.TimeSeries}
          query={query}
          filter={{
            ...filterState.common,
            ...filterState.timeSeries,
          }}
          label={t('TIMESERIES', 'Time series')}
        />
      );
    if (tab === 'sequence')
      return (
        <SequenceTab
          tabKey={ViewType.Sequence}
          query={query}
          filter={{
            ...filterState.common,
            ...filterState.sequence,
          }}
          label={t('SEQUENCES', 'Sequences')}
        />
      );
    return <ThreeDTab tabKey={ViewType.ThreeD} query={query} />;
  });

  const isBulkActionBarVisible =
    selectionMode === 'multiple' && actionBarOptions.length > 0;

  return (
    <ResourceSelectorWrapper>
      {!shouldOnlyShowPreviewPane && (
        <FilterWrapper visible={showFilter}>
          <SidebarFilters
            query={query}
            enableDocumentLabelsFilter
            isDocumentsApiEnabled={isDocumentsApiEnabled}
            filter={filterState}
            defaultFilter={defaultFilter}
            onFilterChange={(resourceType, currentFilter) => {
              updateFilterType(resourceType, currentFilter);
            }}
            resourceType={activeKey as ResourceType}
            onResetFilterClick={resetFilterType}
          />
        </FilterWrapper>
      )}

      {!shouldOnlyShowPreviewPane && (
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
                placeholder={t('SEARCH_PLACEHOLDER', 'Search...')}
                onChange={onChangeHandler}
                value={localQuery}
              />
            </InputWrapper>
          </SearchInputContainer>

          <ResourceTypeTabs
            currentResourceType={activeKey}
            setCurrentResourceType={(tab) => setActiveKey(tab as ResourceType)}
          >
            {selectedResourceTabs}
          </ResourceTypeTabs>

          <MainContainer>
            <ResourceSelectorTable
              selectedRows={selectedRows}
              filter={filterState}
              defaultFilter={defaultFilter}
              selectionMode={selectionMode}
              query={query}
              resourceType={activeKey}
              isDocumentsApiEnabled={isDocumentsApiEnabled}
              shouldShowPreviews={shouldShowPreviews}
              onFilterChange={(nextState) => {
                if (isDocumentsApiEnabled) {
                  updateFilterType(
                    activeKey === 'file' ? 'document' : activeKey,
                    nextState
                  );
                } else {
                  updateFilterType(activeKey, nextState);
                }
              }}
              onClick={({ id, externalId }) => {
                setPreviewItem({ id, externalId, type: activeKey });
              }}
              onSelect={handleResourceSelection}
              isBulkActionBarVisible={isBulkActionBarVisible}
            />
          </MainContainer>
        </MainSearchContainer>
      )}

      {previewItem && (
        <ResourcePreviewSidebarWrapper isOnlyPane={shouldOnlyShowPreviewPane}>
          {/* TODO: handle this later for charts */}
          {/* https://cognitedata.atlassian.net/browse/AH-1958 */}
          {activeKey !== 'charts' && (
            <ResourceSelectorDetails
              item={previewItem}
              closable={!shouldOnlyShowPreviewPane}
              onClose={() => setPreviewItem(undefined)}
              selectionMode={selectionMode}
              selectedRows={selectedRows}
              onSelect={handleResourceSelection}
              isSelected={Boolean(
                selectedRows[previewItem.type][previewItem.id]
              )}
              visibleResources={visibleResourceTabs}
              isDocumentsApiEnabled={isDocumentsApiEnabled}
              showSelectButton={shouldOnlyShowPreviewPane ? false : undefined}
              setExtendedProperties={setExtendedProperties}
            />
          )}
        </ResourcePreviewSidebarWrapper>
      )}

      <BulkActionBar
        options={actionBarOptions}
        title={t('SELECTED', 'Selected')}
        subtitle={t('BULK_ACTION_SELECT', `${actionBarOptions.length} items`, {
          itemsLength: actionBarOptions.length,
        })}
        isVisible={isBulkActionBarVisible}
      >
        <Button
          icon="Add"
          onClick={() => {
            onSelect(selectedResources as any);
            setSelectedRows(INITIAL_SELECTED_ROWS);
          }}
          inverted
          type="primary"
          disabled={shouldDisableAddButton}
        >
          {addButtonText ? addButtonText : t('ADD', 'Add')}
        </Button>
        <BulkActionBar.Separator />
        <Button
          icon="Close"
          onClick={() => setSelectedRows(INITIAL_SELECTED_ROWS)}
          inverted
        />
      </BulkActionBar>
    </ResourceSelectorWrapper>
  );
};

const ResourceSelectorWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
  position: relative;
  height: 100%;
`;
const MainSearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  overflow: auto;
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
  height: 100%;
  flex: 1;
  overflow: auto;
`;

const ResourcePreviewSidebarWrapper = styled.div<{ isOnlyPane?: boolean }>`
  width: 370px;
  margin: 12px;
  flex: 1;
  border-left: ${({ isOnlyPane }) =>
    isOnlyPane ? '' : '1px solid var(--cogs-border--muted)'};
`;
