import React, { useState } from 'react';
import { Flex, SegmentedControl } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';
import { EnsureNonEmptyResource } from 'components';
import { ColumnToggleProps } from 'components/ReactTable/Table';
import {
  AssetTreeTable,
  SearchResultToolbar,
  AssetNewTable,
  useResourceResults,
} from 'containers';
import { convertResourceType, SelectableItemsProps } from 'types';
import { KeepMounted } from '../../../components/KeepMounted/KeepMounted';
import styled from 'styled-components';
import { EmptyState } from 'components/EmpyState/EmptyState';
import { useAssetsFilteredListQuery } from 'domain/assets/internal/queries/useAssetsFilteredListQuery';
import { InternalAssetFilters } from 'domain/assets/internal/types';
import { TableSortBy } from 'components/ReactTable/V2';

export const AssetSearchResults = ({
  query = '',
  filter,
  showCount = false,
  onClick,
  isTreeEnabled,
  enableAdvancedFilters,
  ...extraProps
}: {
  enableAdvancedFilters?: boolean;
  query?: string;
  isTreeEnabled?: boolean;
  showCount?: boolean;
  filter: InternalAssetFilters;
  onClick: (item: Asset) => void;
} & ColumnToggleProps<Asset> &
  SelectableItemsProps) => {
  const api = convertResourceType('asset');
  const { canFetchMore, fetchMore, items, isFetched } =
    useResourceResults<Asset>(api, query, filter);

  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { data, hasNextPage, fetchNextPage, isLoading } =
    useAssetsFilteredListQuery({ assetFilter: filter, sortBy: sortBy });

  const [currentView, setCurrentView] = useState<string>(() =>
    isTreeEnabled ? 'tree' : 'list'
  );

  const { onSelect, selectionMode, isSelected, ...rest } = extraProps;
  const treeProps = { onSelect, selectionMode, isSelected };

  const loading = enableAdvancedFilters ? isLoading : !isFetched;
  if (loading) {
    return <EmptyState isLoading={loading} title="Loading Assets..." />;
  }

  const tableHeaders = (
    <StyledTableHeader justifyContent="space-between" alignItems="center">
      <SearchResultToolbar
        showCount={showCount}
        api={query.length > 0 ? 'search' : 'list'}
        type="asset"
        filter={filter}
        query={query}
      />

      {isTreeEnabled ? (
        <Flex alignItems="center" gap={10}>
          <SegmentedControl
            currentKey={currentView}
            onButtonClicked={setCurrentView}
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
      <EnsureNonEmptyResource api="asset">
        {currentView !== 'list' ? tableHeaders : null}
        <KeepMounted isVisible={currentView === 'list'}>
          <AssetNewTable
            {...rest}
            id="asset-search-results"
            onRowClick={asset => onClick(asset)}
            data={enableAdvancedFilters ? data : items}
            enableSorting
            onSort={props => setSortBy(props)}
            showLoadButton
            tableHeaders={tableHeaders}
            hasNextPage={enableAdvancedFilters ? hasNextPage : canFetchMore}
            fetchMore={enableAdvancedFilters ? fetchNextPage : fetchMore}
          />
        </KeepMounted>

        <KeepMounted isVisible={currentView !== 'list'}>
          <AssetTreeTable
            filter={filter}
            query={query}
            onAssetClicked={asset => onClick(asset)}
            {...treeProps}
          />
        </KeepMounted>
      </EnsureNonEmptyResource>
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
