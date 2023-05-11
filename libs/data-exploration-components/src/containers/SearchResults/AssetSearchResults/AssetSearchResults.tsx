import React, { useMemo, useState } from 'react';
import { Flex, SegmentedControl } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';

import {
  AssetTreeTable,
  SearchResultToolbar,
  AssetTable,
  SearchResultCountLabel,
} from '@data-exploration-components/containers';
import { KeepMounted } from '../../../components/KeepMounted/KeepMounted';
import styled from 'styled-components';
import { AppliedFiltersTags } from '@data-exploration-components/components/AppliedFiltersTags/AppliedFiltersTags';
import {
  useAssetsSearchResultWithLabelsQuery,
  useAssetsSearchAggregateQuery,
  TableSortBy,
} from '@data-exploration-lib/domain-layer';
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
  activeIds,
  onFilterChange,
  ...rest
}: {
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
}) => {
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { data, isLoading, isPreviousData, hasNextPage, fetchNextPage } =
    useAssetsSearchResultWithLabelsQuery({
      query,
      assetFilter: filter,
      sortBy,
    });

  const assetSearchConfig = useGetSearchConfigFromLocalStorage('asset');

  const { data: aggregateData } = useAssetsSearchAggregateQuery(
    {
      assetsFilters: filter,
      query,
    },
    assetSearchConfig
  );

  const loadedDataCount = data.length;
  const totalDataCount = aggregateData.count;

  const currentView = isTreeEnabled ? view : 'list';

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
          data={data}
          isDataLoading={isLoading}
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
          hasNextPage={!isPreviousData && hasNextPage}
          fetchMore={fetchNextPage}
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
        />
      </KeepMounted>
    </>
  );
};

const StyledTableHeader = styled(Flex)`
  flex: 1;
`;
