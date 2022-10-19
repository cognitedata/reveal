import React, { useState } from 'react';
import { Flex, SegmentedControl } from '@cognite/cogs.js';
import { AssetFilterProps, Asset } from '@cognite/sdk';
import { EnsureNonEmptyResource } from 'components';
import { AssetTreeTable, SearchResultToolbar, AssetNewTable } from 'containers';
import {
  SelectableItemsProps,
  DateRangeProps,
  TableStateProps,
  convertResourceType,
} from 'types';
import { KeepMounted } from '../../../components/KeepMounted/KeepMounted';
import { useResourceResults } from '..';
import styled from 'styled-components';
import { EmptyState } from 'components/EmpyState/EmptyState';

export const AssetSearchResults = ({
  query = '',
  filter,
  showCount = false,
  onClick,
  ...extraProps
}: {
  query?: string;
  showCount?: boolean;
  filter: AssetFilterProps;
  onClick: (item: Asset) => void;
} & SelectableItemsProps &
  TableStateProps &
  DateRangeProps) => {
  const [currentView, setCurrentView] = useState<string>('tree');
  const api = convertResourceType('asset');

  const { canFetchMore, fetchMore, items, isFetched } =
    useResourceResults<Asset>(api, query, filter);

  if (!isFetched) {
    return <EmptyState isLoading={!isFetched} title="Loading Assets..." />;
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
    </StyledTableHeader>
  );

  return (
    <>
      <EnsureNonEmptyResource api="asset">
        {currentView !== 'list' ? tableHeaders : null}
        <KeepMounted isVisible={currentView === 'list'}>
          <AssetNewTable
            onRowClick={asset => onClick(asset)}
            data={items}
            showLoadButton
            tableHeaders={tableHeaders}
            hasNextPage={canFetchMore}
            fetchMore={fetchMore}
          />
        </KeepMounted>

        <KeepMounted isVisible={currentView !== 'list'}>
          <AssetTreeTable
            filter={filter}
            query={query}
            onAssetClicked={asset => onClick(asset)}
            {...extraProps}
          />
        </KeepMounted>
      </EnsureNonEmptyResource>
    </>
  );
};
const StyledTableHeader = styled(Flex)`
  flex: 1;
`;
