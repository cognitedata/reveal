import React, { useMemo, useState } from 'react';
import { Flex, SegmentedControl } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';

import {
  AssetTreeTable,
  SearchResultToolbar,
  AssetTable,
  useResourceResults,
  SearchResultCountLabel,
} from '@data-exploration-components/containers';
import {
  convertResourceType,
  SelectableItemsProps,
} from '@data-exploration-components/types';
import { KeepMounted } from '../../../components/KeepMounted/KeepMounted';
import styled from 'styled-components';
import { AppliedFiltersTags } from '@data-exploration-components/components/AppliedFiltersTags/AppliedFiltersTags';
import {
  useAssetsSearchResultWithLabelsQuery,
  useAssetsSearchAggregateQuery,
  TableSortBy,
} from '@data-exploration-lib/domain-layer';
import { useResultCount } from '@data-exploration-components/components';
import { VerticalDivider } from '@data-exploration-components/components/Divider';
import {
  InternalAssetFilters,
  useGetSearchConfigFromLocalStorage,
} from '@data-exploration-lib/core';

export type AssetViewMode = 'list' | 'tree';

export const AssetSearchResults = ({
  query = '',
  filter = {},
  showCount = false,
  onClick,
  onShowAllAssetsClick,
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
  onShowAllAssetsClick: (item: Asset) => void;
  activeIds?: (string | number)[];
  onFilterChange?: (newValue: Record<string, unknown>) => void;
} & SelectableItemsProps) => {
  const api = convertResourceType('asset');
  const { canFetchMore, fetchMore, items, isFetched } =
    useResourceResults<Asset>(api, query, filter);
  const { count: itemCount } = useResultCount({
    type: 'asset',
    filter,
    query,
    api: query && query.length > 0 ? 'search' : 'list',
  });

  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { data, isLoading, isPreviousData, hasNextPage, fetchNextPage } =
    useAssetsSearchResultWithLabelsQuery(
      {
        query,
        assetFilter: filter,
        sortBy,
      },
      { enabled: enableAdvancedFilters }
    );

  const assetSearchConfig = useGetSearchConfigFromLocalStorage('asset');

  const { data: aggregateData } = useAssetsSearchAggregateQuery(
    {
      assetsFilters: filter,
      query,
    },
    { enabled: enableAdvancedFilters },
    assetSearchConfig
  );

  const loadedDataCount = enableAdvancedFilters ? data.length : items.length;
  const totalDataCount = enableAdvancedFilters
    ? aggregateData.count
    : itemCount;

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

    return {};
  }, [activeIds]);

  const tableHeaders = (
    <StyledTableHeader justifyContent="space-between" alignItems="center">
      <SearchResultToolbar
        type="asset"
        showCount={showCount}
        resultCount={
          <SearchResultCountLabel
            loadedCount={loadedDataCount}
            totalCount={totalDataCount}
            resourceType="asset"
          />
        }
      />

      {isTreeEnabled ? (
        <Flex alignItems="center" gap={10}>
          <SegmentedControl
            currentKey={currentView}
            onButtonClicked={(nextView) =>
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
          <VerticalDivider />
        </Flex>
      ) : null}
    </StyledTableHeader>
  );

  return (
    <>
      <KeepMounted isVisible={currentView === 'list'}>
        <AssetTable
          id="asset-search-results"
          query={query}
          onRowClick={(asset) => onClick(asset)}
          data={enableAdvancedFilters ? data : items}
          isDataLoading={enableAdvancedFilters ? isLoading : !isFetched}
          enableSorting={enableAdvancedFilters}
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
          onAssetClicked={(asset) => onClick(asset)}
          onAssetSeeMoreClicked={(asset) => {
            onShowAllAssetsClick(asset);
          }}
          tableHeaders={currentView !== 'list' ? tableHeaders : undefined}
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
