import React, { useMemo, useState } from 'react';
import { Flex, SegmentedControl } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';

import {
  AssetTreeTable,
  SearchResultToolbar,
  AssetTable,
  useResourceResults,
  SearchResultCountLabel,
} from 'containers';
import { convertResourceType, SelectableItemsProps } from 'types';
import { KeepMounted } from '../../../components/KeepMounted/KeepMounted';
import styled from 'styled-components';
import { TableSortBy } from 'components/Table';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';
import {
  InternalAssetFilters,
  useAssetsSearchAggregateQuery,
  useAssetsSearchResultQuery,
} from 'domain/assets';

export type AssetViewMode = 'list' | 'tree';

export const AssetSearchResults = ({
  query = '',
  filter = {},
  showCount = false,
  onClick,
  view,
  onViewChange,
  isTreeEnabled,
  enableAdvancedFilters,
  activeIds,
  onFilterChange,
  ...extraProps
}: {
  enableAdvancedFilters?: boolean;
  query?: string;
  view: AssetViewMode;
  onViewChange: (nextView: AssetViewMode) => void;
  isTreeEnabled?: boolean;
  showCount?: boolean;
  filter: InternalAssetFilters;
  onClick: (item: Asset) => void;
  activeIds?: (string | number)[];
  onFilterChange?: (newValue: Record<string, unknown>) => void;
} & SelectableItemsProps) => {
  const api = convertResourceType('asset');
  const { canFetchMore, fetchMore, items, isFetched } =
    useResourceResults<Asset>(api, query, filter);

  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { data, isLoading, isPreviousData, hasNextPage, fetchNextPage } =
    useAssetsSearchResultQuery({
      query,
      assetFilter: filter,
      sortBy,
    });

  const { data: aggregateData } = useAssetsSearchAggregateQuery({
    assetsFilters: filter,
    query,
  });
  const loadedDataCount = enableAdvancedFilters ? data.length : items.length;

  const currentView = isTreeEnabled ? view : 'list';

  const { onSelect, selectionMode, isSelected, ...rest } = extraProps;
  const treeProps = { onSelect, selectionMode, isSelected };

  const selectedRows = useMemo(() => {
    if (activeIds) {
      return activeIds.reduce((previousValue, currentValue) => {
        return {
          ...previousValue,
          [currentValue]: true,
        };
      }, {});
    }
  }, [activeIds]);

  const tableHeaders = (
    <StyledTableHeader justifyContent="space-between" alignItems="center">
      <SearchResultToolbar
        type="asset"
        showCount={showCount}
        resultCount={
          <SearchResultCountLabel
            loadedCount={loadedDataCount}
            totalCount={aggregateData.count}
            resourceType="asset"
          />
        }
      />

      {isTreeEnabled ? (
        <Flex alignItems="center" gap={10}>
          <SegmentedControl
            currentKey={currentView}
            onButtonClicked={nextView =>
              onViewChange(nextView as AssetViewMode)
            }
          >
            <SegmentedControl.Button
              icon="Tree"
              key="tree"
              title="Asset hierarchy"
              aria-label="Asset hierarchy"
            />
            <SegmentedControl.Button
              icon="List"
              key="list"
              title="List"
              aria-label="List"
            />
          </SegmentedControl>
          <Divider />
        </Flex>
      ) : null}
    </StyledTableHeader>
  );

  return (
    <>
      <KeepMounted isVisible={currentView === 'list'}>
        <AssetTable
          id="asset-search-results"
          onRowClick={asset => onClick(asset)}
          data={enableAdvancedFilters ? data : items}
          isDataLoading={enableAdvancedFilters ? isLoading : !isFetched}
          enableSorting
          sorting={sortBy}
          selectedRows={selectedRows}
          scrollIntoViewRow={
            activeIds?.length === 1 && currentView === 'list'
              ? activeIds[0]
              : undefined
          }
          onSort={setSortBy}
          showLoadButton
          tableSubHeaders={
            <AppliedFiltersTags
              filter={filter}
              onFilterChange={onFilterChange}
              icon="Assets"
            />
          }
          tableHeaders={currentView === 'list' ? tableHeaders : undefined}
          hasNextPage={
            enableAdvancedFilters
              ? !isPreviousData && hasNextPage
              : canFetchMore
          }
          fetchMore={enableAdvancedFilters ? fetchNextPage : fetchMore}
          {...rest}
        />
      </KeepMounted>

      <KeepMounted isVisible={currentView !== 'list'}>
        <AssetTreeTable
          filter={filter}
          query={query}
          onAssetClicked={asset => onClick(asset)}
          tableHeaders={currentView !== 'list' ? tableHeaders : undefined}
          enableAdvancedFilters={enableAdvancedFilters}
          selectedRows={selectedRows}
          tableSubHeaders={
            <AppliedFiltersTags
              filter={filter}
              onFilterChange={onFilterChange}
              icon="Assets"
            />
          }
          scrollIntoViewRow={
            activeIds?.length === 1 && currentView !== 'list'
              ? activeIds[0]
              : undefined
          }
          {...treeProps}
        />
      </KeepMounted>
    </>
  );
};

const StyledTableHeader = styled(Flex)`
  flex: 1;
`;

const Divider = styled.div`
  height: 16px;
  width: 2px;
  background: var(--cogs-border--muted);
`;
