import React, { useMemo, useState } from 'react';

import styled from 'styled-components';

import {
  TableProps,
  KeepMounted,
  VerticalDivider,
} from '@data-exploration/components';

import { Flex, SegmentedControl } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';

import {
  InternalAssetFilters,
  useGetSearchConfigFromLocalStorage,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  useAssetsSearchResultWithLabelsQuery,
  useAssetsSearchAggregateQuery,
  TableSortBy,
  AssetWithRelationshipLabels,
} from '@data-exploration-lib/domain-layer';

import { AppliedFiltersTags } from '../AppliedFiltersTags';
import { SearchResultCountLabel } from '../SearchResultCountLabel';
import { SearchResultToolbar } from '../SearchResultToolbar';

import { AssetTable } from './AssetTable';
import { AssetTreeTable } from './AssetTreeTable';

export type AssetViewMode = 'list' | 'tree';

type AssetTreeView =
  | { isTreeEnabled?: false; onViewChange?: never; view?: never }
  | {
      isTreeEnabled?: true;
      onViewChange: (nextView: AssetViewMode) => void;
      view: AssetViewMode;
      onShowAllAssetsClick: (item: Asset) => void;
    };
export const AssetSearchResults = ({
  query = '',
  filter = {},
  showCount = false,
  onClick,
  onShowAllAssetsClick,
  view,
  onViewChange,
  isTreeEnabled = false,
  id,
  activeIds,
  onFilterChange,
  ...rest
}: {
  query?: string;
  id?: string;

  showCount?: boolean;
  filter: InternalAssetFilters;
  onClick: (item: Asset) => void;
  onShowAllAssetsClick?: (item: Asset) => void;
  activeIds?: (string | number)[];
  onFilterChange?: (newValue: Record<string, unknown>) => void;
} & Omit<TableProps<AssetWithRelationshipLabels>, 'columns' | 'data' | 'id'> &
  AssetTreeView) => {
  const { t } = useTranslation();

  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const [treeViewAssetsCount, setTreeViewAssetsCount] = useState(0);

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

  const currentView = isTreeEnabled ? view : 'list';

  const loadedDataCount =
    currentView === 'list' ? data.length : treeViewAssetsCount;
  const totalDataCount = aggregateData.count;

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
              onViewChange?.(nextView as AssetViewMode)
            }
          >
            <SegmentedControl.Button
              icon="Tree"
              key="tree"
              title={t('ASSET_HIERARCHY', 'Asset hierarchy')}
              aria-label="Asset hierarchy"
            />
            <SegmentedControl.Button
              icon="List"
              key="list"
              title={t('LIST', 'List')}
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
          id={id || 'asset-search-results'}
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

      <KeepMounted isVisible={currentView === 'tree'}>
        <AssetTreeTable
          filter={filter}
          query={query}
          onAssetClicked={(asset) => onClick(asset)}
          onAssetSeeMoreClicked={(asset) => {
            onShowAllAssetsClick?.(asset);
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
          onDataChanged={(treeViewAssets) => {
            setTreeViewAssetsCount(treeViewAssets.length);
          }}
        />
      </KeepMounted>
    </>
  );
};

const StyledTableHeader = styled(Flex)`
  flex: 1;
`;
